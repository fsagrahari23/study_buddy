"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Sparkles, TrendingUp, BookOpen, Target, Zap, Award } from "lucide-react"
import { DashboardLayout } from "../../components/dashboard-layout"
// Sample data
const studyData = [
  { day: "Mon", hours: 4.2, target: 5 },
  { day: "Tue", hours: 5.1, target: 5 },
  { day: "Wed", hours: 3.8, target: 5 },
  { day: "Thu", hours: 6.2, target: 5 },
  { day: "Fri", hours: 5.9, target: 5 },
  { day: "Sat", hours: 7.1, target: 5 },
  { day: "Sun", hours: 4.5, target: 5 },
]

const subjectData = [
  { name: "Mathematics", value: 92, color: "hsl(var(--chart-1))" },
  { name: "Physics", value: 85, color: "hsl(var(--chart-2))" },
  { name: "Chemistry", value: 88, color: "hsl(var(--chart-3))" },
  { name: "Biology", value: 79, color: "hsl(var(--chart-4))" },
  { name: "English", value: 91, color: "hsl(var(--chart-5))" },
]

const progressData = [
  { month: "Jan", completed: 12, total: 20 },
  { month: "Feb", completed: 18, total: 20 },
  { month: "Mar", completed: 15, total: 20 },
  { month: "Apr", completed: 19, total: 20 },
  { month: "May", completed: 17, total: 20 },
  { month: "Jun", completed: 20, total: 20 },
]

const recentActivity = [
  { id: 1, title: "Completed Calculus Module", time: "2 hours ago", icon: "✓", color: "bg-green-500" },
  { id: 2, title: "Started Physics Chapter 5", time: "5 hours ago", icon: "→", color: "bg-blue-500" },
  { id: 3, title: "Quiz: Chemistry Basics - 95%", time: "1 day ago", icon: "★", color: "bg-yellow-500" },
  { id: 4, title: "Completed 7-day streak", time: "2 days ago", icon: "🔥", color: "bg-orange-500" },
]

export default function Dashboard() {
  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
    setAnimateCards(true)
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    LearnHub
                  </h1>
                  <p className="text-xs text-muted-foreground">Your Learning Dashboard</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">Welcome back!</p>
                <p className="text-xs text-muted-foreground">Keep up the great work</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Day One Welcome Section */}
          <div className={`mb-8 transition-smooth ${animateCards ? "animate-slide-up" : "opacity-0"}`}>
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 hover:shadow-xl transition-smooth">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-smooth" />
              <CardContent className="pt-8 pb-8 relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-secondary" />
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        Day 1 - Welcome
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-foreground">Welcome to Your Learning Journey! 🚀</h2>
                    <p className="text-muted-foreground max-w-2xl">
                      You're all set to start learning. Today is the perfect day to build new habits and achieve your
                      goals. Let's make today count!
                    </p>
                    <div className="flex gap-4 mt-4">
                      <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-smooth">
                        Start Learning
                      </button>
                      <button className="px-6 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-smooth">
                        View Goals
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block text-6xl animate-float">📚</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Study Hours", value: "32.8", unit: "hrs", icon: BookOpen, color: "from-primary to-primary/50" },
              { label: "Current Streak", value: "7", unit: "days", icon: Zap, color: "from-secondary to-secondary/50" },
              { label: "Avg Score", value: "87", unit: "%", icon: Award, color: "from-accent to-accent/50" },
              { label: "Goals Met", value: "18", unit: "/20", icon: Target, color: "from-green-500 to-green-500/50" },
            ].map((metric, idx) => {
              const Icon = metric.icon
              return (
                <Card
                  key={idx}
                  className={`relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-smooth hover:scale-105 cursor-pointer group ${animateCards ? "animate-slide-up" : "opacity-0"
                    }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10 group-hover:opacity-20 transition-smooth`}
                  />
                  <CardContent className="pt-6 pb-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-smooth" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Study Hours Chart */}
            <Card
              className={`border-0 shadow-md hover:shadow-lg transition-smooth ${animateCards ? "animate-slide-up" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Weekly Study Hours
                </CardTitle>
                <CardDescription>Your study time vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    hours: { label: "Study Hours", color: "hsl(var(--chart-1))" },
                    target: { label: "Target", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="hours" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="target" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Subject Performance - Static Pie Chart */}
            <Card
              className={`border-0 shadow-md hover:shadow-lg transition-smooth ${animateCards ? "animate-slide-up" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Subject Performance
                </CardTitle>
                <CardDescription>Your scores across subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Score", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Progress and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Chart */}
            <Card
              className={`lg:col-span-2 border-0 shadow-md hover:shadow-lg transition-smooth ${animateCards ? "animate-slide-up" : "opacity-0"}`}
              style={{ animationDelay: "400ms" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" />
                  Monthly Progress
                </CardTitle>
                <CardDescription>Goals completed this year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: { label: "Completed", color: "hsl(var(--chart-1))" },
                    total: { label: "Total", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card
              className={`border-0 shadow-md hover:shadow-lg transition-smooth ${animateCards ? "animate-slide-up" : "opacity-0"}`}
              style={{ animationDelay: "500ms" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-smooth group cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-smooth`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
