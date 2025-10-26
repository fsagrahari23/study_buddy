"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

export function PDFViewer({ file }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  console.log(file)

  const totalPages = 245 // Placeholder, as pages are removed from schema

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="text-base md:text-lg truncate">{file?.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              disabled={zoom <= 50}
              className="text-xs md:text-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs md:text-sm font-medium w-10 md:w-12 text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              disabled={zoom >= 200}
              className="text-xs md:text-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2 md:p-4">
        {/* PDF Display Area */}
        <div className="flex-1 bg-muted rounded-lg mb-3 md:mb-4 overflow-auto">
          <iframe
            src={file?.url}
            className="w-full h-full rounded-lg"
            title={`PDF Viewer - ${file?.name}`}
          />
        </div>

        {/* Navigation */}

      </CardContent>
    </Card>
  )
}
