"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addQuiz, setGeneratingQuiz, setGenerationError } from "@/lib/slices/quizzesSlice"
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

  // Sample chapters for each file
  const chaptersByFile = {
    1: [
      { id: "ch1", name: "Chapter 1: Introduction", pages: "1-44" },
      { id: "ch2", name: "Chapter 2: Algebra Basics", pages: "45-78" },
      { id: "ch3", name: "Chapter 3: Advanced Algebra", pages: "79-120" },
      { id: "ch4", name: "Chapter 4: Calculus Fundamentals", pages: "121-180" },
    ],
    2: [
      { id: "ch1", name: "Chapter 1: Introduction", pages: "1-30" },
      { id: "ch2", name: "Chapter 2: Motion and Forces", pages: "31-70" },
      { id: "ch3", name: "Chapter 3: Energy", pages: "71-110" },
    ],
  }

  const selectedChapters = chaptersByFile[formData.fileId] || []
  const selectedFile = files.find((f) => f.id === formData.fileId)
  const selectedChapter = selectedChapters.find((ch) => ch.id === formData.chapter)

  // Mock AI question generation
  const generateQuestionsFromChapter = () => {
    const difficultyLevels = {
      beginner: ["easy", "easy", "easy"],
      intermediate: ["easy", "intermediate", "intermediate", "hard"],
      advanced: ["intermediate", "hard", "hard"],
    }

    const difficulties = difficultyLevels[formData.difficulty] || []
    const numQuestions = Number.parseInt(formData.numQuestions)

    const sampleQuestions = [
      {
        id: "q1",
        question: "What is the fundamental concept discussed in this chapter?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0,
        explanation: "This is the correct answer based on the chapter content.",
        difficulty: "easy",
      },
      {
        id: "q2",
        question: "How does this concept relate to real-world applications?",
        options: ["Application 1", "Application 2", "Application 3", "Application 4"],
        correct: 1,
        explanation: "The concept is primarily used in this application.",
        difficulty: "intermediate",
      },
      {
        id: "q3",
        question: "What is the advanced interpretation of this principle?",
        options: ["Interpretation A", "Interpretation B", "Interpretation C", "Interpretation D"],
        correct: 2,
        explanation: "Advanced understanding requires this interpretation.",
        difficulty: "hard",
      },
    ]

    return sampleQuestions.slice(0, numQuestions)
  }

  const handleGenerateQuiz = async () => {
    if (!formData.title || !formData.fileId || !formData.chapter) {
      dispatch(setGenerationError("Please fill in all required fields"))
      return
    }

    dispatch(setGeneratingQuiz(true))
    dispatch(setGenerationError(null))

    // Simulate AI generation delay
    setTimeout(() => {
      const questions = generateQuestionsFromChapter()

      const newQuiz = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        fileId: formData.fileId,
        fileName: selectedFile.name,
        chapter: selectedChapter.name,
        chapterPages: selectedChapter.pages,
        difficulty: formData.difficulty,
        category: selectedFile.name.split(".")[0],
        totalQuestions: questions.length,
        totalScore: questions.length * 10,
        timeLimit: Math.ceil(questions.length * 2.5),
        questions: questions,
      }

      dispatch(addQuiz(newQuiz))
      dispatch(setGeneratingQuiz(false))
      setSuccess(true)

      setTimeout(() => {
        onClose()
      }, 2000)
    }, 2000)
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
        <CardTitle>Generate Quiz from Chapter</CardTitle>
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
          >
            <SelectTrigger disabled={generatingQuiz}>
              <SelectValue placeholder="Choose a file" />
            </SelectTrigger>
            <SelectContent>
              {files.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.fileId && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Chapter *</label>
            <Select value={formData.chapter} onValueChange={(value) => setFormData({ ...formData, chapter: value })}>
              <SelectTrigger disabled={generatingQuiz}>
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent>
                {selectedChapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapter.name} (Pages {chapter.pages})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger disabled={generatingQuiz}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Questions</label>
            <Select
              value={formData.numQuestions}
              onValueChange={(value) => setFormData({ ...formData, numQuestions: value })}
            >
              <SelectTrigger disabled={generatingQuiz}>
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
