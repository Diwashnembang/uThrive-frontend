export type UserRole = "user" | "service_provider" | "admin"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  serviceProviderId: string
  serviceProviderName: string
  maxParticipants?: number
  currentParticipants: number
  createdAt: string
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  registeredAt: string
}
