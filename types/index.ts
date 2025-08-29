export type UserRole = "user" | "serviceProvider" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  BusinessName?: string
  Phone?: string
  Address?: string  
  description?: string
}

export interface ServiceProvider {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: string;                  // matches JSON
  Name: string; // capital N to match JSON
  description: string | null;  // can be null
  date: string;
  location: string;
  serviceProviderId: string;
  serviceProvider: ServiceProvider;   // nested object
  ConfirmedUsers: User[];            // array of users
  maxParticipants?: number;
  currentParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  registeredAt: string
}

export interface CreateEventInput {
  Name: string;
  description?: string | null;
  date: string;
  location: string;
  serviceProviderId: string;
  maxParticipants?: number;
}
