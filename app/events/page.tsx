"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateEvent } from "@/hooks/useEvents";
// import {
//   getEvents,
//   getEventRegistrations,
//   registerForEvent,
//   unregisterFromEvent,
//   initializeDummyEvents,
// } from "@/lib/data";
import type { Event, EventRegistration } from "@/types";
import { useAuthStore } from "@/store/useStore";

export default function EventsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  // const [events, setEvents] = useState<Event[]>([])
  const {
    error: createEventError,
    events,
    getAllEvents,
    registerUserForEvent,
    unregisterUserFromEvent,
    registrations,
  } = useCreateEvent();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  // const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past">(
    "upcoming"
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [processingEventId, setProcessingEventId] = useState<string | null>(
    null
  );

  useEffect(() => {
    (async () => {
      loadData();
    })();
  }, []);
  useEffect(() => {
   
  }, [events]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterType]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  useEffect(() => {
    console.log("events changed", events);
  }, [events]);
  const loadData = async () => {
    await getAllEvents();

    // setRegistrations(getEventRegistrations())
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.description ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.serviceProvider.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by time
    const now = new Date();
    if (filterType === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.date) > now);
    } else if (filterType === "past") {
      filtered = filtered.filter((event) => new Date(event.date) <= now);
    }

    // Sort by date (upcoming events first, then by date)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (filterType === "upcoming") {
        return dateA.getTime() - dateB.getTime(); // Earliest upcoming first
      } else {
        return dateB.getTime() - dateA.getTime(); // Most recent past first
      }
    });

    setFilteredEvents(filtered);
  };

  const isUserRegistered = (eventId: string) => {
    if (!user) return false;
    return registrations.some(
      (reg) => reg.eventId === eventId && reg.userId === user?.id
    );
  };

  const getEventRegistrationCount = (eventId: string) => {
    return registrations.filter((reg) => reg.eventId === eventId).length;
  };

  const isEventFull = (event: Event) => {
    if (!event.maxParticipants) return false;
    const registrationCount = getEventRegistrationCount(event.id);
    return registrationCount >= event.maxParticipants;
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      router.push("/auth/user/login");
      return;
    }

    setProcessingEventId(eventId);
    setMessage(null);

    try {
      const result = await registerUserForEvent(eventId);

      if (result && result.success) {
        setMessage({ type: "success", text: result.message });
        // // Create new registration
        // const newRegistration: EventRegistration = {
        //   id: `reg-${Date.now()}`,
        //   eventId,
        //   userId: user.id,
        //   registeredAt: new Date().toISOString(),
        // };
        // setRegistrations((prevRegs) => [...prevRegs, newRegistration]);

        loadData(); // Refresh data to show updated registration status
      } else if (result) {
        setMessage({ type: "error", text: result.message });
      } else {
        setMessage({
          type: "error",
          text: "Registration failed: No response from server.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setProcessingEventId(null);
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) {
      router.push("/auth/user/login");
      return;
    }

    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    // setProcessingEventId(eventId);
    setMessage(null);

    try {
      const result = await unregisterUserFromEvent(eventId);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        loadData(); // Refresh data to show updated registration status
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setProcessingEventId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
            <p className="text-gray-600">
              Discover and join exciting events near you
            </p>
          </div>
          <div className="flex gap-2">
            {user ? (
              <Button onClick={logout} variant="outline">
                Logout ({user.name})
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/auth/user/login")}
                  variant="outline"
                >
                  Login
                </Button>
                <Button onClick={() => router.push("/auth/user/register")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {!user && (
          <Alert className="mb-6">
            <AlertDescription>
              <strong>Want to register for events?</strong> Please{" "}
              <button
                onClick={() => router.push("/auth/user/login")}
                className="text-blue-600 hover:underline font-medium"
              >
                login
              </button>{" "}
              or{" "}
              <button
                onClick={() => router.push("/auth/user/register")}
                className="text-blue-600 hover:underline font-medium"
              >
                create an account
              </button>{" "}
              to register for events.
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <div className="mb-6">
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search events by name, description, location, or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                >
                  All Events
                </Button>
                <Button
                  variant={filterType === "upcoming" ? "default" : "outline"}
                  onClick={() => setFilterType("upcoming")}
                  size="sm"
                >
                  Upcoming
                </Button>
                <Button
                  variant={filterType === "past" ? "default" : "outline"}
                  onClick={() => setFilterType("past")}
                  size="sm"
                >
                  Past Events
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg mb-2">
                {events.length === 0
                  ? "No events available yet."
                  : searchTerm || filterType !== "all"
                  ? "No events match your search criteria."
                  : "No events found."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            filteredEvents.map((event) => {
              const registrationCount = getEventRegistrationCount(event.id);
              const isRegistered = isUserRegistered(event.id);
              const isFull = isEventFull(event);
              const isUpcoming = new Date(event.date) > new Date();
              const isPast = new Date(event.date) <= new Date();
              const isProcessing = processingEventId === event.id;

              return (
                <Card key={event.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{event.Name}</CardTitle>
                        <CardDescription>
                          by {event.serviceProvider.name}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        {isRegistered && (
                          <Badge variant="default">Registered</Badge>
                        )}
                        {isFull && <Badge variant="destructive">Full</Badge>}
                        {isPast && (
                          <Badge variant="secondary">Past Event</Badge>
                        )}
                        {isUpcoming && !isFull && (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-700 mb-4 flex-1">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(event.date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>
                          {registrationCount} registered
                          {event.maxParticipants &&
                            ` / ${event.maxParticipants} max`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {isPast ? (
                        <Button disabled className="w-full">
                          Event Ended
                        </Button>
                      ) : !user ? (
                        <Button
                          className="w-full"
                          onClick={() => router.push("/auth/user/login")}
                        >
                          Login to Register
                        </Button>
                      ) : isRegistered ? (
                        <div className="space-y-2">
                          <Button disabled className="w-full">
                            ✓ Registered
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => handleUnregister(event.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : "Unregister"}
                          </Button>
                        </div>
                      ) : isFull ? (
                        <Button disabled className="w-full">
                          Event Full
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleRegister(event.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing
                            ? "Registering..."
                            : "Register for Event"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {events.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {events.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {events.filter((e) => new Date(e.date) > new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {user
                      ? registrations.filter((r) => r.userId === user.id).length
                      : 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Your Registrations
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(events.map((e) => e.serviceProviderId)).size}
                  </div>
                  <div className="text-sm text-gray-600">Organizers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
