"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

export function PDFViewer({ file }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  const totalPages = file?.pages || 245

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
        <div className="flex-1 bg-muted rounded-lg mb-3 md:mb-4 flex items-center justify-center overflow-auto">
          <div
            className="bg-white p-4 md:p-8 rounded shadow-lg"
            style={{
              width: `${zoom}%`,
              maxWidth: "100%",
              aspectRatio: "8.5/11",
            }}
          >
            <div className="h-full flex flex-col justify-center items-center text-center">
              <p className="text-2xl md:text-4xl font-bold text-muted-foreground mb-4">Page {currentPage}</p>
              <p className="text-xs md:text-sm text-muted-foreground px-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
              <div className="mt-4 md:mt-8 p-3 md:p-4 bg-blue-50 rounded text-xs md:text-sm text-left">
                <p className="font-semibold mb-2">Sample PDF Content:</p>
                <p>This is a mock PDF viewer. In production, use pdf.js library to render actual PDFs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-full md:w-auto text-xs md:text-sm bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span className="text-xs md:text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-full md:w-auto text-xs md:text-sm bg-transparent"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
