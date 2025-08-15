"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUsers } from "@/lib/auth"
import { getEvents, getEventRegistrations, deleteUser, deleteEvent } from "@/lib/data"
import type { User, Event, EventRegistration } from "@/types"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/admin/login")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }

    // Load data
    setUsers(getUsers())
    setEvents(getEvents())
    setRegistrations(getEventRegistrations())
    setLoading(false)
  }, [user, router])

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId)
      setUsers(getUsers())
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(eventId)
      setEvents(getEvents())
      setRegistrations(getEventRegistrations())
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const regularUsers = users.filter((u) => u.role === "user")
  const serviceProviders = users.filter((u) => u.role === "service_provider")
  const admins = users.filter((u) => u.role === "admin")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regularUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Service Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceProviders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Event Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage registered users and service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Regular Users ({regularUsers.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {regularUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                          Delete
                        </Button>
                      </div>
                    ))}
                    {regularUsers.length === 0 && <p className="text-gray-500 text-sm">No users registered yet</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Service Providers ({serviceProviders.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {serviceProviders.map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-sm text-gray-600">{provider.email}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(provider.id)}>
                          Delete
                        </Button>
                      </div>
                    ))}
                    {serviceProviders.length === 0 && (
                      <p className="text-gray-500 text-sm">No service providers registered yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Management */}
          <Card>
            <CardHeader>
              <CardTitle>Events Management</CardTitle>
              <CardDescription>Monitor and manage all events on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.map((event) => {
                  const eventRegistrations = registrations.filter((r) => r.eventId === event.id)
                  return (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <p className="text-sm text-gray-600">by {event.serviceProviderName}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}>
                          Delete
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>📍 {event.location}</span>
                        <Badge variant="secondary">{eventRegistrations.length} registered</Badge>
                      </div>
                    </div>
                  )
                })}
                {events.length === 0 && <p className="text-gray-500 text-sm">No events created yet</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
