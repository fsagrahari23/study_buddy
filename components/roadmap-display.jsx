"use client"

import { useSelector, useDispatch } from "react-redux"
import { updateRoadmapProgress } from "@/lib/slices/roadmapSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, TrendingUp, Clock, Target } from "lucide-react"

export function RoadmapDisplay() {
  const dispatch = useDispatch()
  const { roadmap, recommendations } = useSelector((state) => state.roadmap)

  if (!roadmap) {
    return null
  }

  const handleMilestoneComplete = (milestoneId) => {
    dispatch(
      updateRoadmapProgress({
        milestoneId,
        completed: true,
        progress: 100,
      }),
    )
  }

  const completedMilestones = roadmap.milestones.filter((m) => m.completed).length

  return (
    <div className="space-y-6">
      {/* Roadmap Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {roadmap.title}
          </CardTitle>
          <CardDescription>{roadmap.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">
                {Math.round((completedMilestones / roadmap.milestones.length) * 100)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-sm text-muted-foreground">Estimated Duration</p>
              <p className="text-2xl font-bold">{roadmap.estimatedDuration}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{roadmap.successRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Learning Milestones</h3>
        {roadmap.milestones.map((milestone, idx) => (
          <Card key={milestone.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {milestone.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base">{milestone.title}</CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{idx + 1}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{milestone.duration}</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">{milestone.progress}%</p>
                </div>
                <Progress value={milestone.progress} className="h-2" />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Tasks</p>
                <ul className="space-y-1">
                  {milestone.tasks.map((task, taskIdx) => (
                    <li key={taskIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              {!milestone.completed && (
                <Button onClick={() => handleMilestoneComplete(milestone.id)} variant="outline" className="w-full">
                  Mark as Complete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Recommendations</h3>
        <div className="grid gap-4">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className={`border-l-4 ${
                rec.priority === "high"
                  ? "border-l-red-500 bg-red-500/5"
                  : rec.priority === "medium"
                    ? "border-l-yellow-500 bg-yellow-500/5"
                    : "border-l-blue-500 bg-blue-500/5"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      rec.priority === "high"
                        ? "bg-red-500/20 text-red-700"
                        : rec.priority === "medium"
                          ? "bg-yellow-500/20 text-yellow-700"
                          : "bg-blue-500/20 text-blue-700"
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  {rec.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
