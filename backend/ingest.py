# import os
# import re
# from typing import Dict, List, Tuple
# from dotenv import load_dotenv
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
# from langchain_community.vectorstores import FAISS

# # Load API key from .env file
# load_dotenv()
# if not os.getenv("GOOGLE_API_KEY"):
#     raise EnvironmentError("GOOGLE_API_KEY not found. Please create a .env file.")

# def detect_chapters(pdf_path: str) -> Dict[str, Tuple[int, int]]:
#     """
#     Detects chapters in the PDF and returns their page ranges.
#     Returns a dictionary of {chapter_name: (start_page, end_page)}
#     """
#     loader = PyPDFLoader(pdf_path)
#     docs = loader.load()
    
#     chapter_patterns = [
#         r'chapter\s+(\d+|[IVXivx]+)[:\s]+([^\n]+)',  # Chapter 1: Title or Chapter I: Title
#         r'(\d+|\b[IVXivx]+\b)[:\s]+([^\n]{3,})',     # 1. Title or I. Title
#         r'chapter\s+(\d+|[IVXivx]+)',                 # Just "Chapter 1" or "Chapter I"
#         r'(\d+)\s*\.\s*([^\n]{3,})',                 # 1. Title format
#         r'introduction|conclusion|appendix'            # Common section names
#     ]
    
#     chapters = {}
#     current_chapter = None
#     chapter_start = 1
    
#     for i, doc in enumerate(docs, 1):
#         text = doc.page_content.lower().strip()
        
#         # Check for chapter markers
#         for pattern in chapter_patterns:
#             matches = re.finditer(pattern, text.lower())
#             for match in matches:
#                 if current_chapter:
#                     # End the previous chapter
#                     chapters[current_chapter] = (chapter_start, i - 1)
                
#                 # Start a new chapter
#                 if match.group(0).startswith(('chapter', '1', '2', '3', '4', '5', '6', '7', '8', '9')):
#                     current_chapter = f"Chapter {match.group(1)}"
#                 else:
#                     current_chapter = match.group(0).title()
#                 chapter_start = i
#                 break
    
#     # Add the last chapter
#     if current_chapter:
#         chapters[current_chapter] = (chapter_start, len(docs))
    
#     return chapters

# def get_pdf_vector_store(pdf_path: str, chapter_name: str = None) -> FAISS:
#     """
#     Creates a vector store from a PDF, optionally filtered by chapter.
    
#     Args:
#         pdf_path (str): Path to the PDF file
#         chapter_name (str, optional): Name of the chapter to process
    
#     Returns:
#         FAISS: Vector store with the processed content
#     """
#     print(f"Loading document: {pdf_path}")
    
#     # Detect chapters
#     chapters = detect_chapters(pdf_path)
    
#     # Load the PDF
#     loader = PyPDFLoader(pdf_path)
#     docs = loader.load()
    
#     # Filter by chapter if specified
#     if chapter_name:
#         # Try to find the chapter (case-insensitive)
#         chapter_key = next(
#             (k for k in chapters.keys() 
#              if k.lower() == chapter_name.lower()),
#             None
#         )
        
#         if not chapter_key:
#             raise ValueError(f"Chapter '{chapter_name}' not found. Available chapters: {', '.join(chapters.keys())}")
        
#         start_page, end_page = chapters[chapter_key]
#         docs = [doc for i, doc in enumerate(docs, 1) 
#                 if start_page <= i <= end_page]
        
#         print(f"Processing chapter '{chapter_key}' (pages {start_page}-{end_page})")
    
#     # Chunk the documents
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=1000,
#         chunk_overlap=150
#     )
#     chunks = text_splitter.split_documents(docs)
    
#     # Add chapter metadata to chunks
#     for chunk in chunks:
#         page = chunk.metadata.get('page', 0)
#         for chapter, (start, end) in chapters.items():
#             if start <= page <= end:
#                 chunk.metadata['chapter'] = chapter
#                 break
    
#     print(f"Created {len(chunks)} chunks")
    
#     # Initialize embeddings and create vector store
#     embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
#     return FAISS.from_documents(chunks, embeddings)

# def get_available_chapters(pdf_path: str) -> List[str]:
#     """
#     Returns a list of available chapters in the PDF.
#     """
#     chapters = detect_chapters(pdf_path)
#     return list(chapters.keys())

import os
import json
import re
from typing import Dict, List, Tuple
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings  # Changed to local
from langchain_community.vectorstores import FAISS

# Load environment variables from .env file
load_dotenv()
if not os.getenv("GOOGLE_API_KEY"):
    print("Warning: GOOGLE_API_KEY not found. This is fine if you're not using Gemini LLM.")


def detect_chapters(pdf_path: str) -> Dict[str, Tuple[int, int]]:
    """
    Detects chapters in the PDF and returns their page ranges.
    Returns a dictionary of {chapter_name: (start_page, end_page)}
    """
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    
    # Compile stricter, anchored regex patterns
    chapter_patterns = [
        # Pattern 1: "Chapter 1: Title" or "Chapter I. Title"
        re.compile(r'^\s*chapter\s+(\d+|[IVXivx]+)\s*[:.]?\s*([^\n]+)', re.IGNORECASE),
        # Pattern 2: "Chapter 1" or "Chapter I"
        re.compile(r'^\s*chapter\s+(\d+|[IVXivx]+)\s*$', re.IGNORECASE),
        # Pattern 3: "Introduction", "Conclusion", "Appendix"
        re.compile(r'^\s*(introduction|conclusion|appendix)\s*$', re.IGNORECASE),
    ]

    chapters = {}
    current_chapter = None
    chapter_start = 1

    for i, doc in enumerate(docs, 1):
        # We only check the first 5 lines for a chapter title
        lines = doc.page_content.strip().split('\n')[:5]
        
        found_title = None
        for line in lines:
            line = line.strip()
            if not line: # Skip empty lines
                continue

            new_title = None
            
            # Check Pattern 1: "Chapter 1: Title"
            match = chapter_patterns[0].match(line)
            if match:
                num = match.group(1)
                title = match.group(2).strip()
                # Clean up junk titles
                new_title = f"Chapter {num}: {title}" if len(title) > 3 else f"Chapter {num}"
            
            # Check Pattern 2: "Chapter 1"
            if not new_title:
                match = chapter_patterns[1].match(line)
                if match:
                    new_title = f"Chapter {match.group(1)}"

            # Check Pattern 3: "Introduction"
            if not new_title:
                match = chapter_patterns[2].match(line)
                if match:
                    new_title = match.group(1).strip().title()
            
            if new_title:
                found_title = new_title
                break # Stop checking lines

        # Now, if we found a new title, register it
        if found_title:
            if current_chapter:
                # End the previous chapter
                chapters[current_chapter] = (chapter_start, i - 1)
            
            # Start a new chapter
            current_chapter = found_title
            chapter_start = i

    # Add the last chapter
    if current_chapter:
        if current_chapter not in chapters:
             chapters[current_chapter] = (chapter_start, len(docs))
    
    # Add a fallback for books with no detected chapters
    if not chapters and len(docs) > 0:
        chapters["Full Document"] = (1, len(docs))
        
    return chapters


def get_pdf_vector_store(pdf_path: str, chapter_name: str = None) -> FAISS:
    """
    Creates a vector store from a PDF, optionally filtered by chapter.
    
    Args:
        pdf_path (str): Path to the PDF file
        chapter_name (str, optional): Name of the chapter to process
    
    Returns:
        FAISS: Vector store with the processed content
    """
    print(f"Loading document: {pdf_path}")
    
    # Detect chapters
    chapters = detect_chapters(pdf_path)
    
    # Load the PDF
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    
    # Filter by chapter if specified
    if chapter_name:
        chapter_key = next(
            (k for k in chapters.keys() 
             if k.lower().strip() == chapter_name.lower().strip()),
            None
        )
        
        if not chapter_key:
            raise ValueError(f"Chapter '{chapter_name}' not found. Available chapters: {', '.join(chapters.keys())}")
        
        start_page, end_page = chapters[chapter_key]
        docs = [doc for i, doc in enumerate(docs, 1) 
                if start_page <= i <= end_page]
        
        print(f"Processing chapter '{chapter_key}' (pages {start_page}-{end_page})")
    
    # Chunk the documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )
    chunks = text_splitter.split_documents(docs)
    
    # Add chapter metadata to chunks
    for chunk in chunks:
        # PyPDFLoader pages are 0-indexed, but our detection is 1-indexed
        page = chunk.metadata.get('page', 0) + 1 
        for chapter, (start, end) in chapters.items():
            if start <= page <= end:
                chunk.metadata['chapter'] = chapter
                break
    
    print(f"Created {len(chunks)} chunks")
    
    # --- EMBEDDING MODEL (Using Local HuggingFace) ---
    print("Initializing local HuggingFace embeddings...")
    
    # Use local embeddings - downloads model on first run
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},  # Use 'cuda' if you have GPU
        encode_kwargs={'normalize_embeddings': True}
    )
    
    print(f"Using local model: sentence-transformers/all-MiniLM-L6-v2")
    
    # Create vector store
    try:
        return FAISS.from_documents(chunks, embeddings)
    except Exception as e:
        raise ValueError(f"Failed to create vector store: {e}")


def get_available_chapters(pdf_path: str) -> List[str]:
    """
    Returns a list of available chapters in the PDF.
    """
    chapters = detect_chapters(pdf_path)
    return list(chapters.keys())