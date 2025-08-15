"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getEvents, saveEvents, getEventRegistrations } from "@/lib/data"
import type { Event, EventRegistration } from "@/types"

export default function ProviderEventsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    maxParticipants: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/auth/provider/login")
      return
    }

    if (user.role !== "service_provider") {
      router.push("/")
      return
    }

    loadData()
  }, [user, router])

  const loadData = () => {
    const allEvents = getEvents()
    const providerEvents = allEvents.filter((event) => event.serviceProviderId === user?.id)
    setEvents(providerEvents)
    setRegistrations(getEventRegistrations())
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      date: "",
      location: "",
      maxParticipants: "",
    })
    setEditingEvent(null)
    setShowCreateForm(false)
    setError("")
    setSuccess("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim() || !formData.description.trim() || !formData.date || !formData.location.trim()) {
      setError("Please fill in all required fields")
      return
    }

    const eventDate = new Date(formData.date)
    if (eventDate < new Date()) {
      setError("Event date must be in the future")
      return
    }

    const allEvents = getEvents()

    if (editingEvent) {
      // Update existing event
      const updatedEvents = allEvents.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              name: formData.name,
              description: formData.description,
              date: formData.date,
              location: formData.location,
              maxParticipants: formData.maxParticipants ? Number.parseInt(formData.maxParticipants) : undefined,
            }
          : event,
      )
      saveEvents(updatedEvents)
      setSuccess("Event updated successfully!")
    } else {
      // Create new event
      const newEvent: Event = {
        id: `event-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        serviceProviderId: user!.id,
        serviceProviderName: user!.name,
        maxParticipants: formData.maxParticipants ? Number.parseInt(formData.maxParticipants) : undefined,
        currentParticipants: 0,
        createdAt: new Date().toISOString(),
      }
      allEvents.push(newEvent)
      saveEvents(allEvents)
      setSuccess("Event created successfully!")
    }

    loadData()
    resetForm()
  }

  const handleEdit = (event: Event) => {
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      location: event.location,
      maxParticipants: event.maxParticipants?.toString() || "",
    })
    setEditingEvent(event)
    setShowCreateForm(true)
  }

  const handleDelete = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      const allEvents = getEvents()
      const updatedEvents = allEvents.filter((event) => event.id !== eventId)
      saveEvents(updatedEvents)
      loadData()
      setSuccess("Event deleted successfully!")
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== "service_provider") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600">Manage your events and track registrations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
              Create New Event
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {(error || success) && (
          <div className="mb-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingEvent ? "Edit Event" : "Create New Event"}</CardTitle>
              <CardDescription>
                {editingEvent ? "Update your event details" : "Fill in the details for your new event"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter event location"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Maximum Participants (Optional)</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingEvent ? "Update Event" : "Create Event"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Events ({events.length})</CardTitle>
              <CardDescription>Manage and monitor your created events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                  <Button onClick={() => setShowCreateForm(true)}>Create Your First Event</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => {
                    const eventRegistrations = registrations.filter((r) => r.eventId === event.id)
                    const isUpcoming = new Date(event.date) > new Date()

                    return (
                      <div key={event.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{event.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>📅 {new Date(event.date).toLocaleString()}</span>
                              <span>📍 {event.location}</span>
                              <Badge variant={isUpcoming ? "default" : "secondary"}>
                                {isUpcoming ? "Upcoming" : "Past"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">{event.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{eventRegistrations.length} registered</Badge>
                            {event.maxParticipants && (
                              <span className="text-sm text-gray-600">Max: {event.maxParticipants} participants</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            Created {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
