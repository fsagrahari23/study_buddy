"use client"

import { useSelector } from "react-redux"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, BarChart3, MessageSquare } from "lucide-react"

export default function AdminPage() {
  const files = useSelector((state) => state.files.files)
  const notes = useSelector((state) => state.notes.notes)
  const quizzes = useSelector((state) => state.quizzes.quizzes)
  const chats = useSelector((state) => state.chats.chats)

  const stats = [
    { label: "Total Users", value: 1250, icon: Users, color: "text-blue-600" },
    { label: "Files Uploaded", value: files.length, icon: FileText, color: "text-green-600" },
    { label: "Quizzes Created", value: quizzes.length, icon: BarChart3, color: "text-purple-600" },
    { label: "Chat Sessions", value: chats.length, icon: MessageSquare, color: "text-orange-600" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Management Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  { name: "John Doe", email: "john@example.com", role: "Student", status: "Active" },
                  { name: "Jane Smith", email: "jane@example.com", role: "Student", status: "Active" },
                  { name: "Admin User", email: "admin@example.com", role: "Admin", status: "Active" },
                ].map((user, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{user.status}</span>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">View All Users</Button>
            </CardContent>
          </Card>

          {/* System Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Session Duration</span>
                  <span className="font-bold">45 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Active Users</span>
                  <span className="font-bold">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Study Hours</span>
                  <span className="font-bold">12,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Quiz Score</span>
                  <span className="font-bold">78%</span>
                </div>
              </div>
              <Button className="w-full">View Detailed Analytics</Button>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 border border-border rounded-lg">
                  <p className="font-medium text-sm">PDF Files</p>
                  <p className="text-2xl font-bold">{files.length}</p>
                  <p className="text-xs text-muted-foreground">Total uploaded</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <p className="font-medium text-sm">Study Notes</p>
                  <p className="text-2xl font-bold">{notes.length}</p>
                  <p className="text-xs text-muted-foreground">Total created</p>
                </div>
              </div>
              <Button className="w-full">Manage Content</Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border border-border rounded">
                  <span className="text-sm">Maintenance Mode</span>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-2 border border-border rounded">
                  <span className="text-sm">Email Notifications</span>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-2 border border-border rounded">
                  <span className="text-sm">API Access</span>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              </div>
              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "User registered", user: "Sarah Johnson", time: "2 hours ago" },
                { action: "PDF uploaded", user: "Mike Chen", time: "4 hours ago" },
                { action: "Quiz completed", user: "Emma Davis", time: "6 hours ago" },
                { action: "Note created", user: "Alex Kumar", time: "8 hours ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
