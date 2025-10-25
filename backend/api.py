import os
import json
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.chains.combine_documents.stuff import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain


# Load environment variables (GOOGLE_API_KEY)
load_dotenv()
if not os.getenv("GOOGLE_API_KEY"):
    raise EnvironmentError("GOOGLE_API_KEY not found in .env file")

# --- 1. Pydantic Models (Matches your JSON spec) ---

class QuizRequest(BaseModel):
    fileId: str = Field(..., example="hesc110.pdf")  # The PDF filename
    chapter: str = Field(..., example="Chapter 1")   # Chapter name (e.g., "Chapter 1", "Introduction")
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    numberOfQuestions: int = Field(..., example=5)
    title: str = Field(..., example="Chapter 1 Quiz")
    description: str | None = None

class QuizQuestion(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str

class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]

# --- 2. Initialize FastAPI App ---
app = FastAPI(
    title="Quiz Generator API",
    description="Generates quizzes from documents using LangChain and Gemini",
)

# --- 3. Helper Functions ---

from ingest import get_pdf_vector_store, get_available_chapters

def load_vector_store_from_pdf(file_id: str, chapter: str):
    """
    Creates a vector store from the specified chapter in the PDF.
    """
    pdf_path = f"data/pdf/{file_id}"
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"PDF file '{file_id}' not found in data/pdf directory")
    
    try:
        # Get vector store for the specified chapter
        return get_pdf_vector_store(pdf_path, chapter)
    
    except ValueError as e:
        error_str = str(e)
        # Check which type of ValueError it is
        if "Chapter" in error_str and "not found" in error_str:
            # This is a chapter error
            available_chapters = get_available_chapters(pdf_path)
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid chapter. Available chapters: {', '.join(available_chapters)}"
            )
        elif "Hugging Face API Error" in error_str:
            # This is our new, clear embedding error
            raise HTTPException(status_code=503, detail=error_str) # 503 Service Unavailable
        else:
            # Some other unexpected ValueError
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {error_str}")
    
    except Exception as e:
        # Catch-all for other errors
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

def parse_llm_json_output(llm_output: str) -> dict:
    """Cleans and parses the JSON output from the LLM."""
    try:
        # Gemini often wraps JSON in ```json ... ```
        match = re.search(r"```json\s*([\s\S]+?)\s*```", llm_output)
        if match:
            json_str = match.group(1)
        else:
            json_str = llm_output

        return json.loads(json_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Failed to decode LLM JSON response: {llm_output}")

# --- 4. LangChain RAG Chain Definition ---

# Define the prompt template
# This instructs the LLM how to behave and what format to use
PROMPT_TEMPLATE = """
You are an expert quiz creator. Your task is to generate a quiz based *only* on the provided context.
The user wants a quiz for the chapter: "{chapter}".
The quiz must have exactly {num_questions} questions at a {difficulty} difficulty level.

Generate the quiz in a valid JSON format. Do not include any other text before or after the JSON.
The JSON object should have a single key "questions", which is a list of question objects.
Each question object must have:
1. "question_text": The question.
2. "options": A list of exactly 4 strings (A, B, C, D).
3. "correct_answer": The full text of the correct option.

CONTEXT:
{context}
"""

def create_quiz_generation_chain(vector_store, chapter, num_questions, difficulty):
    """
    Creates the full RAG chain for quiz generation.
    """
    # 1. Initialize Gemini LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.3,
        convert_system_message_to_human=True # Helps with compatibility
    )
    
    # 2. Create a retriever, FILTERED BY CHAPTER
    # This is the most important part for chapter-specific quizzes
    retriever = vector_store.as_retriever(
        search_kwargs={'filter': {'chapter': chapter}}
    )
    
    # 3. Create the prompt from the template
    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    
    # 4. Create the "stuff" chain
    # This chain takes context (from retriever) and other inputs, and formats the prompt
    question_generator_chain = create_stuff_documents_chain(llm, prompt)

    # 5. Create the main Retrieval Chain
    # This chain runs the retriever (using 'input') and passes docs to the question_generator_chain
    retrieval_chain = create_retrieval_chain(retriever, question_generator_chain)
    
    return retrieval_chain

# --- 5. API Endpoint ---

@app.post("/quizzes", response_model=QuizResponse)
async def create_quiz(request: QuizRequest):
    """
    Creates a new quiz based on the provided parameters.
    """
    print(f"Received quiz request for chapter: {request.chapter}")
    
    # 1. Load the specific vector store from PDF
    vector_store = load_vector_store_from_pdf(request.fileId, request.chapter)

    # 2. Create the RAG chain
    chain = create_quiz_generation_chain(
        vector_store, 
        request.chapter, 
        request.numberOfQuestions, 
        request.difficulty
    )
    
    # 3. Invoke the chain
    # The 'input' is used by the retriever to find relevant docs *within the filtered chapter*
    try:
        response = await chain.ainvoke({
            "input": f"All key concepts and facts from {request.chapter}",
            "chapter": request.chapter,
            "num_questions": request.numberOfQuestions,
            "difficulty": request.difficulty
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error invoking LangChain: {e}")

    # 4. Parse the LLM's answer
    llm_output = response.get('answer', '{}')
    quiz_data = parse_llm_json_output(llm_output)

    # 5. Format and return the final response
    return QuizResponse(
        title=request.title,
        questions=quiz_data.get("questions", [])
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting API server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)