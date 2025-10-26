"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addQuiz, setGeneratingQuiz, setGenerationError } from "@/lib/slices/quizzesSlice"
import { setFiles } from "@/lib/slices/filesSlice"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function QuizGenerator({ onClose }) {
  const dispatch = useDispatch()
  const files = useSelector((state) => state.files.files)
  const generatingQuiz = useSelector((state) => state.quizzes.generatingQuiz)
  const generationError = useSelector((state) => state.quizzes.generationError)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileId: "",
    chapter: "",
    difficulty: "intermediate",
    numQuestions: "10",
  })

  const [success, setSuccess] = useState(false)

  // Fetch files on component mount
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

  const selectedFile = files.find((f) => f._id === formData.fileId || f.id === formData.fileId)

  const handleGenerateQuiz = async () => {
    if (!formData.title || !formData.fileId || !formData.chapter) {
      dispatch(setGenerationError("Please fill in all required fields"))
      return
    }

    dispatch(setGeneratingQuiz(true))
    dispatch(setGenerationError(null))

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: formData.fileId,
          chapter: formData.chapter,
          difficulty: formData.difficulty,
          numQuestions: formData.numQuestions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate quiz")
      }

      const newQuiz = await response.json()

      dispatch(addQuiz(newQuiz))
      dispatch(setGeneratingQuiz(false))
      setSuccess(true)

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error generating quiz:", error)
      dispatch(setGenerationError(error.message))
      dispatch(setGeneratingQuiz(false))
    }
  }

  if (success) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Quiz Generated Successfully!</h3>
          <p className="text-sm text-muted-foreground">Your quiz is ready to take.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Quiz from Topic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {generationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title *</label>
          <Input
            placeholder="e.g., Algebra Chapter 2 Quiz"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={generatingQuiz}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Input
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={generatingQuiz}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select File *</label>
          <Select
            value={formData.fileId}
            onValueChange={(value) => setFormData({ ...formData, fileId: value, chapter: "" })}
            disabled={generatingQuiz}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a file" />
            </SelectTrigger>
            <SelectContent>
              {files.map((file) => (
                <SelectItem key={file._id || file.id} value={file._id || file.id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.fileId && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Topic *</label>
            <Select value={formData.chapter} onValueChange={(value) => setFormData({ ...formData, chapter: value })}>
              <SelectTrigger disabled={generatingQuiz}>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {selectedFile?.topics?.map((topic, index) => (
                  <SelectItem key={index} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(!selectedFile?.topics || selectedFile.topics.length === 0) && (
              <p className="text-xs text-muted-foreground mt-1">
                No topics available for this file. Please upload and process the file first.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              disabled={generatingQuiz}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Questions</label>
            <Select
              value={formData.numQuestions}
              onValueChange={(value) => setFormData({ ...formData, numQuestions: value })}
              disabled={generatingQuiz}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerateQuiz} disabled={generatingQuiz} className="flex-1">
            {generatingQuiz ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={generatingQuiz} className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
