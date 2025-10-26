"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoadmapGenerator } from "@/components/roadmap-generator"
import { RoadmapDisplay } from "@/components/roadmap-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { fetchRoadmap } from "../../lib/slices/roadmapSlice"

// Simple number counting component
function CountUp({ end, duration = 1000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / (duration / 16)
    const animate = () => {
      start += increment
      if (start < end) {
        setCount(Math.round(start))
        requestAnimationFrame(animate)
      } else {
        setCount(Math.round(end))
      }
    }
    animate()
  }, [end, duration])

  return <span>{count}</span>
}

export default function RoadmapPage() {
  const { roadmap, isGenerating } = useSelector((state) => state.roadmap)
  const dispatch = useDispatch()

  const [stats, setStats] = useState({
    studyHours: "0.0h",
    avgScore: "0%",
    quizzesTaken: 0,
    notesViewed: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch roadmap from Redux
  useEffect(() => {
    dispatch(fetchRoadmap())
  }, [])

  // Fetch dashboard stats from API
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/roadmap/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        console.log(data)
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])
  console.log(stats)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Learning Roadmap</h1>
          <p className="text-muted-foreground">
            AI-powered personalized learning path based on your activity and performance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {!roadmap && <div className="lg:col-span-1">
            <RoadmapGenerator />
          </div>
          }
          <div className="lg:col-span-2">
            {isGenerating ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Analyzing your activity...</p>
                  </div>
                </CardContent>
              </Card>
            ) : roadmap ? (
              <RoadmapDisplay />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">Generate your first roadmap to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity Summary</CardTitle>
            <CardDescription>Overview of your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-muted-foreground">Total Study Hours</p>
                  <p className="text-2xl font-bold">
                    <CountUp end={parseFloat(stats?.studyHours)} />h
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
                  <p className="text-sm text-muted-foreground">Notes Viewed</p>
                  <p className="text-2xl font-bold">
                    <CountUp end={stats?.notesViewed} />
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 text-center">
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">
                    <CountUp end={parseInt(stats?.avgScore)} />%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
                  <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                  <p className="text-2xl font-bold">
                    <CountUp end={stats?.quizzesTaken} />
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
