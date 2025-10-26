"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuizGenerator } from "@/components/quiz-generator"
import { Plus, BookOpen, Play, Search } from "lucide-react"
import Link from "next/link"
import { fetchQuizzes } from "@/lib/slices/quizzesSlice"
import { setFiles } from "@/lib/slices/filesSlice"
import { recordActivity } from "@/lib/slices/activitySlice"

export default function QuizzesPage() {
  const dispatch = useDispatch()
  const quizzes = useSelector((state) => state.quizzes.quizzes)
  const [showGenerator, setShowGenerator] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Fetch quizzes and files on component mount
  useEffect(() => {
    dispatch(fetchQuizzes())

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

  // Get unique categories
  const categories = ["all", ...new Set(quizzes.map((q) => q.category))]
  const difficulties = ["all", "beginner", "intermediate", "advanced"]

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === "all" || quiz.difficulty === filterDifficulty
    const matchesCategory = filterCategory === "all" || quiz.category === filterCategory

    return matchesSearch && matchesDifficulty && matchesCategory
  })

  // Group quizzes by category
  const groupedQuizzes = filteredQuizzes.reduce((acc, quiz) => {
    if (!acc[quiz.category]) {
      acc[quiz.category] = []
    }
    acc[quiz.category].push(quiz)
    return acc
  }, {})

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "advanced":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge and track progress</p>
          </div>
          <Button onClick={() => setShowGenerator(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Generate Quiz
          </Button>
        </div>

        {/* Quiz Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <QuizGenerator onClose={() => setShowGenerator(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quizzes by Category */}
        {Object.keys(groupedQuizzes).length > 0 ? (
          Object.entries(groupedQuizzes).map(([category, categoryQuizzes]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryQuizzes.map((quiz) => (
                  <Card key={quiz._id || quiz.id} className="hover:border-primary transition-colors flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{quiz.fileName || quiz.fileId}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-2">{quiz.description}</p>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">{quiz.chapter}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                            {quiz.questions?.length || quiz.numQuestions || 0} Questions
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mt-auto">
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground text-xs">Score</p>
                          <p className="font-bold">{quiz.totalScore || 0}</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground text-xs">Time</p>
                          <p className="font-bold">{quiz.timeLimit || 30} min</p>
                        </div>
                      </div>

                      <Link href={`/quizzes/${quiz._id || quiz.id}`} className="w-full">
                        <Button className="w-full" onClick={() => dispatch(recordActivity({ action: "quiz_taken", details: { quizId: quiz._id || quiz.id } }))}>
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No quizzes found. Create one to get started.</p>
            <Button onClick={() => setShowGenerator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Your First Quiz
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
