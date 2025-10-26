"use client"

import React, { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PDFViewer } from "@/components/pdf-viewer"
import { ChatPanel } from "@/components/chat-panel"
import { NoteGenerationPanel } from "@/components/note-generation-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { setCurrentFile, addFile, setFiles } from "@/lib/slices/filesSlice"
import { loadFileChat } from "@/lib/slices/chatsSlice"
import { recordActivity } from "@/lib/slices/activitySlice"
import { Upload, FileText, Menu, X } from "lucide-react"

import { getSignedURL } from "../upload/action"
import { saveFile } from "../upload/saveaction"



export default function StudyPage() {
  const dispatch = useDispatch()
  const files = useSelector((state) => state.files.files)
  const currentFile = useSelector((state) => state.files.currentFile) || files[0]


  const [showUpload, setShowUpload] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null) // store selected File
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files')
        if (response.ok) {
          const data = await response.json()
          dispatch(setFiles(data.files))
        } else {
          console.error('Failed to fetch files')
        }
      } catch (error) {
        console.error('Error fetching files:', error)
      }
    }

    fetchFiles()
  }, [dispatch])


  const handleFileSelect = (file) => {
    dispatch(setCurrentFile(file))
    setShowSidebar(false)
    // Load chat for the selected file
    dispatch(loadFileChat({ fileId: file.id }))
    dispatch(recordActivity({ action: "file_viewed", details: { fileId: file.id } }))
  }
  const computeSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashhex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashhex
  }
  // central handler when we receive a File (from submit)
  const handleUploadFile = async (file) => {
    if (!file) return
    setIsUploading(true)

    const checksum = await computeSHA256(file)

    try {
      console.log("file uploaded", file)
      const signedUrl = await getSignedURL(
        selectedFile.type,
        selectedFile.size,
        selectedFile.name,
        checksum
      );


      if (signedUrl.failure) throw new Error("Signed URL failed")

      const url = signedUrl.success.url

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      })

      // Construct the public URL
      // const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${selectedFile.name}`

      // Save file to DB and get topics
      const saveResult = await saveFile(selectedFile.name, signedUrl.success.userId, selectedFile.size)

      if (saveResult.failure) throw new Error(saveResult.failure)

      const savedFile = saveResult.success

      dispatch(addFile(savedFile))
      dispatch(setCurrentFile(savedFile))
    } catch (err) {
      console.error(err)
    } finally {
      setSelectedFile(null)
      setShowUpload(false)
      setIsDragging(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setIsUploading(false)
    }
  }

  // selection only — does NOT upload
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("file selected", file)
      setSelectedFile(file)
    }
    // don't reset the input here so user can re-select if needed; keep value for UX
  }

  // drag/drop handlers — selection only
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      console.log("file selected (drop)", file)
      setSelectedFile(file)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Study Materials</h1>
          <p className="text-sm md:text-base text-muted-foreground">Upload PDFs and ask questions using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar - Files List */}
          <div className={`lg:col-span-1 ${showSidebar ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Your Files</CardTitle>
                  <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1 hover:bg-muted rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors text-sm md:text-base ${currentFile?.id === file.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                  </button>
                ))}

                <Button onClick={() => setShowUpload(true)} variant="outline" className="w-full text-xs md:text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Viewer and Chat */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="lg:hidden">
              <Button onClick={() => setShowSidebar(!showSidebar)} variant="outline" className="w-full text-sm">
                <Menu className="w-4 h-4 mr-2" />
                {showSidebar ? "Hide Files" : "Show Files"}
              </Button>
            </div>

            {currentFile ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-[500px] md:min-h-[600px]">
                  {/* PDF Viewer */}
                  <div className="lg:col-span-2 min-h-[400px] md:min-h-[600px]">
                    <PDFViewer file={currentFile} />
                  </div>

                  {/* Chat Panel */}
                  <div className="min-h-[400px] md:min-h-[600px]">
                    <ChatPanel fileId={currentFile._id} pineconeID={currentFile.pineconedoc_id} />
                  </div>
                </div>

                <NoteGenerationPanel fileId={currentFile.id} fileName={currentFile.name} topics={currentFile?.topics || []} pineconeID={currentFile.pineconedoc_id} />

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">Quick Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      placeholder="Take notes while studying..."
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-8 md:p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm md:text-base text-muted-foreground mb-4">No file selected. Upload a PDF to get started.</p>
                <Button onClick={() => setShowUpload(true)} className="text-sm md:text-base">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First PDF
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal / Popover */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowUpload(false)
              setIsDragging(false)
              setSelectedFile(null)
            }}
          />

          <div className="relative z-10 w-full max-w-xl">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload PDF</h3>
                <button
                  onClick={() => {
                    setShowUpload(false)
                    setIsDragging(false)
                    setSelectedFile(null)
                  }}
                  className="p-1 rounded hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border bg-transparent"
                  }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
              >
                <Upload className="mx-auto mb-3 w-8 h-8" />

                {/* show selected file name if present */}
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-muted-foreground">Click "Submit" to upload or choose another file.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm md:text-base mb-2">
                      Drag & drop a PDF here, or <span className="underline">click to browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Only .pdf files supported</p>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowUpload(false)
                    setIsDragging(false)
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  Cancel
                </Button>

                {/* choose file opens file dialog */}
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>

                {/* submit actually uploads the selected file */}
                <Button
                  onClick={() => {
                    if (!selectedFile) {
                      // simple client-side guard — you can replace with nicer UI later
                      console.warn("No file selected to submit.")
                      return
                    }
                    handleUploadFile(selectedFile)
                  }}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Uploading…" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
