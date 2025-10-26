"use client"

import React, { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { animate } from "framer-motion"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

function CountUp({ end = 0, duration = 1.2, decimals = 0, suffix = "" }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const controls = animate(0, Number(end), {
      duration,
      ease: [0.25, 0.1, 0.25, 1], // easeOut-ish cubic
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [end, duration])

  const displayed = decimals > 0 ? value.toFixed(decimals) : Math.round(value)
  return <span>{displayed}{suffix}</span>
}

function SkeletonCard({ lines = 2 }) {
  return (
    <div className="animate-pulse p-4 rounded-lg bg-muted/10 border border-muted/20">
      <div className="h-4 bg-muted/30 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-muted/30 rounded w-full mb-2" />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/dashboard")
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const json = await res.json()
        if (mounted) setData(json)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  // fallback small datasets for charts
  const defaultStudy = [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Loading your learning snapshot</p>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>

          <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SkeletonCard lines={6} />
            <SkeletonCard lines={6} />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/" className="text-primary underline mt-4 inline-block">Go home</Link>
        </div>
      </DashboardLayout>
    )
  }

  const {
    stats = {},
    roadmap = null,
    activities = [],
    quizzes = [],
    flashcards = [],
    files = [],
    user = {},
  } = data || {}

  // derive small chart data from activities/quizzes
  const studyData = (() => {
    try {
      // look for study_session_ended with duration in ms
      const last7 = [0, 0, 0, 0, 0, 0, 0] // Mon..Sun
      activities.forEach((a) => {
        if (a.action === "study_session_ended" && a.details?.duration) {
          const d = new Date(a.timestamp)
          const idx = (d.getDay() + 6) % 7 // make Mon=0
          last7[idx] += (a.details.duration || 0) / 3600000 // to hours
        }
      })
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      return labels.map((lab, i) => ({ day: lab, hours: Math.round(last7[i] * 10) / 10 }))
    } catch (e) {
      return defaultStudy
    }
  })()

  const progressData = (() => {
    // simple subject distribution from quizzes/questions - fallback sample
    const subjects = {}
    quizzes.forEach((q) => {
      if (q.score != null && q.totalQuestions) {
        const s = q.quizId && q.quizId.chapter ? q.quizId.chapter : "General"
        if (!subjects[s]) subjects[s] = []
        subjects[s].push((q.score / (q.totalScore || 1)) * 100)
      }
    })
    const keys = Object.keys(subjects)
    if (keys.length === 0) {
      // fallback
      return [
        { subject: "Math", score: 82 },
        { subject: "Physics", score: 70 },
        { subject: "Chem", score: 88 },
        { subject: "Bio", score: 75 },
        { subject: "History", score: 92 },
      ]
    }
    return keys.slice(0, 6).map((k) => {
      const arr = subjects[k]
      const avg = arr.reduce((s, a) => s + a, 0) / arr.length
      return { subject: k, score: Math.round(avg) }
    })
  })()

  const totalDue = flashcards.reduce((s, d) => s + (d.dueToday || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {user?.name || "Learner"}!</h1>
            <p className="text-sm text-muted-foreground">Compact overview of your learning</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-xl font-semibold">
              <CountUp end={stats.avgScore ?? 0} decimals={1} suffix="%" />
            </p>
          </div>
        </div>

        {/* compact metric cards (X = compact) */}
        <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs">Files</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold">
                  <CountUp end={files.length} />
                </div>
                <div className="text-xs text-muted-foreground">PDFs</div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs">Due Today</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold"><CountUp end={totalDue} /></div>
                <div className="text-xs text-muted-foreground">Flashcards</div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs">Quizzes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold"><CountUp end={stats.quizzesTaken ?? quizzes.length} /></div>
                <div className="text-xs text-muted-foreground">Taken</div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs">Study Hours</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold"><CountUp end={stats.studyHours ?? 0} decimals={1} suffix="h" /></div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs">Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold"><CountUp end={(data.notes || []).length} /></div>
                <div className="text-xs text-muted-foreground">Notes</div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs">Decks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold"><CountUp end={flashcards.length} /></div>
                <div className="text-xs text-muted-foreground">Decks</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm">Study Hours This Week</CardTitle>
              <CardDescription className="text-xs">Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm">Subject Performance</CardTitle>
              <CardDescription className="text-xs">Top subjects</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={progressData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap + Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-4 lg:col-span-1">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm">Roadmap</CardTitle>
              <CardDescription className="text-xs">
                {roadmap ? `${roadmap.milestones?.length ?? 0} milestones` : "Create one to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {roadmap ? (
                <div className="space-y-2">
                  {roadmap.milestones?.slice(0, 3).map((m, idx) => (
                    <div key={m.id || idx} className="flex items-center justify-between gap-3 p-2 rounded border border-muted/10">
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.duration || "—"}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{m.completed ? "Done" : "Pending"}</div>
                    </div>
                  ))}
                  {roadmap.milestones?.length > 3 && <p className="text-xs text-muted-foreground">And {roadmap.milestones.length - 3} more</p>}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">No roadmap yet</p>
                  <Link href="/roadmap">
                    <button className="px-3 py-2 bg-primary text-white rounded text-sm">Create Roadmap</button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-4 lg:col-span-2">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 6).map((a) => (
                    <div key={a._id} className="flex items-start gap-3 p-2 rounded border border-muted/10">
                      <div className="text-xs text-muted-foreground w-28">{new Date(a.timestamp).toLocaleString()}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.details?.title || a.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{a.details?.note || ""}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{a.action}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
