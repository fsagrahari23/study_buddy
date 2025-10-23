"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PDFViewer } from "@/components/pdf-viewer"
import { ChatPanel } from "@/components/chat-panel"
import { NoteGenerationPanel } from "@/components/note-generation-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { setCurrentFile, addFile } from "@/lib/slices/filesSlice"
import { Upload, FileText, Menu, X } from "lucide-react"

export default function StudyPage() {
  const dispatch = useDispatch()
  const files = useSelector((state) => state.files.files)
  const currentFile = useSelector((state) => state.files.currentFile) || files[0]
  const chats = useSelector((state) => state.chats.chats)
  const currentChat = chats.find((c) => c.id === "1") || chats[0]
  const [showUpload, setShowUpload] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const handleFileSelect = (file) => {
    dispatch(setCurrentFile(file))
    setShowSidebar(false)
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        pages: Math.floor(Math.random() * 300) + 50,
        uploadedAt: new Date(),
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      }
      dispatch(addFile(newFile))
      dispatch(setCurrentFile(newFile))
      setShowUpload(false)
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
                    className={`w-full text-left p-3 rounded-lg border transition-colors text-sm md:text-base ${
                      currentFile?.id === file.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.pages} pages</p>
                      </div>
                    </div>
                  </button>
                ))}

                {showUpload ? (
                  <div className="p-3 border-2 border-dashed border-primary rounded-lg">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleUpload}
                      className="w-full text-xs md:text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  <Button onClick={() => setShowUpload(true)} variant="outline" className="w-full text-xs md:text-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                  </Button>
                )}
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
                    <ChatPanel fileId={currentFile.id} chatId={currentChat?.id || "1"} />
                  </div>
                </div>

                <NoteGenerationPanel fileId={currentFile.id} fileName={currentFile.name} />

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
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  No file selected. Upload a PDF to get started.
                </p>
                <Button onClick={() => setShowUpload(true)} className="text-sm md:text-base">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First PDF
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
