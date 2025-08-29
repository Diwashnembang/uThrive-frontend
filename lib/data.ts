import type { Event, EventRegistration } from "@/types"

const EVENTS_KEY = "multi_role_events"
const REGISTRATIONS_KEY = "event_registrations"

export const getEvents = (): Event[] => {
  if (typeof window === "undefined") return []
  const events = localStorage.getItem(EVENTS_KEY)
  return events ? JSON.parse(events) : []
}

export const saveEvents = (events: Event[]) => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export const getEventRegistrations = (): EventRegistration[] => {
  if (typeof window === "undefined") return []
  const registrations = localStorage.getItem(REGISTRATIONS_KEY)
  return registrations ? JSON.parse(registrations) : []
}

export const saveEventRegistrations = (registrations: EventRegistration[]) => {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations))
}

export const deleteUser = (userId: string) => {
  const users = JSON.parse(localStorage.getItem("multi_role_users") || "[]")
  const updatedUsers = users.filter((user: any) => user.id !== userId)
  localStorage.setItem("multi_role_users", JSON.stringify(updatedUsers))
}

export const deleteEvent = (eventId: string) => {
  const events = getEvents()
  const updatedEvents = events.filter((event) => event.id !== eventId)
  saveEvents(updatedEvents)

  // Also remove related registrations
  const registrations = getEventRegistrations()
  const updatedRegistrations = registrations.filter((reg) => reg.eventId !== eventId)
  saveEventRegistrations(updatedRegistrations)
}

export const registerForEvent = (eventId: string, userId: string): { success: boolean; message: string } => {
  const registrations = getEventRegistrations()
  const events = getEvents()

  // Check if user is already registered
  if (registrations.some((reg) => reg.eventId === eventId && reg.userId === userId)) {
    return { success: false, message: "You are already registered for this event" }
  }

  // Check if event exists
  const event = events.find((e) => e.id === eventId)
  if (!event) {
    return { success: false, message: "Event not found" }
  }

  // Check if event is full
  const currentRegistrations = registrations.filter((reg) => reg.eventId === eventId).length
  if (event.maxParticipants && currentRegistrations >= event.maxParticipants) {
    return { success: false, message: "Event is full" }
  }

  // Check if event is in the past
  if (new Date(event.date) <= new Date()) {
    return { success: false, message: "Cannot register for past events" }
  }

  // Create new registration
  const newRegistration: EventRegistration = {
    id: `reg-${Date.now()}`,
    eventId,
    userId,
    registeredAt: new Date().toISOString(),
  }

  registrations.push(newRegistration)
  saveEventRegistrations(registrations)

  return { success: true, message: "Successfully registered for event!" }
}

export const unregisterFromEvent = (eventId: string, userId: string): { success: boolean; message: string } => {
  const registrations = getEventRegistrations()
  const events = getEvents()

  // Check if user is registered
  const registrationIndex = registrations.findIndex((reg) => reg.eventId === eventId && reg.userId === userId)
  if (registrationIndex === -1) {
    return { success: false, message: "You are not registered for this event" }
  }

  // Check if event exists
  const event = events.find((e) => e.id === eventId)
  if (!event) {
    return { success: false, message: "Event not found" }
  }

  // Check if event is in the past (allow unregistration up to event time)
  if (new Date(event.date) <= new Date()) {
    return { success: false, message: "Cannot unregister from past events" }
  }

  // Remove registration
  registrations.splice(registrationIndex, 1)
  saveEventRegistrations(registrations)

  return { success: true, message: "Successfully unregistered from event!" }
}

export const initializeDummyEvents = () => {
  const existingEvents = getEvents()
  if (existingEvents.length > 0) return // Don't overwrite existing events

  const dummyEvents: Event[] = [
    // {
    //   id: "event-1",
    //   ame: "Tech Conference 2025",
    //   description:
    //     "Join us for the biggest tech conference of the year! Learn about the latest trends in AI, web development, and cloud computing from industry experts.",
    //   date: "2025-03-15T09:00:00",
    //   location: "San Francisco Convention Center",
    //   maxParticipants: 500,
    //   currentParticipants: 0,
    //   serviceProviderId: "provider-1",
    //   serviceProviderName: "TechEvents Inc",
    //   createdAt: "2025-01-01T00:00:00",
    // },
    // {
    //   id: "event-2",
    //   Name: "Cooking Workshop: Italian Cuisine",
    //   description:
    //     "Learn to make authentic Italian pasta and sauces from a professional chef. All ingredients and equipment provided.",
    //   date: "2025-02-20T14:00:00",
    //   location: "Culinary Arts Studio, Downtown",
    //   maxParticipants: 20,
    //   currentParticipants: 0,
    //   serviceProviderId: "provider-2",
    //   serviceProviderName: "Chef's Table Academy",
    //   createdAt: "2025-01-02T00:00:00",
    // },
    // {
    //   id: "event-3",
    //   Name: "Yoga & Meditation Retreat",
    //   description:
    //     "A peaceful weekend retreat focusing on mindfulness, yoga practice, and inner peace. Suitable for all levels.",
    //   date: "2025-04-05T08:00:00",
    //   location: "Mountain View Wellness Center",
    //   maxParticipants: 30,
    //   currentParticipants: 0,
    //   serviceProviderId: "provider-3",
    //   serviceProviderName: "Zen Wellness Studio",
    //   createdAt: "2025-01-03T00:00:00",
    // },
    // {
    //   id: "event-4",
    //   Name: "Photography Walk: Urban Landscapes",
    //   description:
    //     "Explore the city through your lens! Learn composition techniques and capture stunning urban photography.",
    //   date: "2025-02-28T10:00:00",
    //   location: "City Center (Meeting Point: Central Plaza)",
    //   maxParticipants: 15,
    //   currentParticipants: 0,
    //   serviceProviderId: "provider-4",
    //   serviceProviderName: "Lens & Light Photography",
    //   createdAt: "2025-01-04T00:00:00",
    // },
    // {
    //   id: "event-5",
    //   Name: "Business Networking Mixer",
    //   description:
    //     "Connect with local entrepreneurs, freelancers, and business professionals. Light refreshments provided.",
    //   date: "2025-03-08T18:00:00",
    //   location: "Downtown Business Hub",
    //   maxParticipants: 100,
    //   currentParticipants: 0,
    //   serviceProviderId: "provider-5",
    //   serviceProvidername: "Business Connect Network",
    //   createdAt: "2025-01-05T00:00:00",
    // },
    // {
    //   id: "event-6",
    //   Name: "Live Jazz Concert",
    //   description: "An evening of smooth jazz featuring local musicians. Enjoy great music in an intimate setting.",
    //   date: "2025-01-25T20:00:00", // Past event
    //   location: "Blue Note Jazz Club",
    //   maxParticipants: 80,
    //   currentParticipants: 0,
    //   serviceProviderId: "provider-6",
    //   serviceProviderName: "Jazz Events Collective",
    //   createdAt: "2025-01-06T00:00:00",
    // },
  ]

  saveEvents(dummyEvents)
}
