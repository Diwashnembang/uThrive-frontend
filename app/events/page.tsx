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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCreateEvent } from "@/hooks/useEvents";
import type { Event } from "@/types";
import { useAuthStore } from "@/store/useStore";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Building2,
  Mail,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Sparkles,
  Search,
  X,
  Heart,
  MessageCircle,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Send,
} from "lucide-react";

export default function EventsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const {
    error: createEventError,
    events,
    getAllEvents,
    registerUserForEvent,
    unregisterUserFromEvent,
    registrations,
  } = useCreateEvent();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
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
  const [optimisticRegistrations, setOptimisticRegistrations] = useState<
    Record<string, { isRegistered: boolean; count: number }>
  >({});
  const [justRegistered, setJustRegistered] = useState<Set<string>>(new Set());
  const [justUnregistered, setJustUnregistered] = useState<Set<string>>(
    new Set()
  );
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );
  const [fullScreenEvent, setFullScreenEvent] = useState<Event | null>(null);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [eventLikes, setEventLikes] = useState<Record<string, number>>({});
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [eventComments, setEventComments] = useState<
    Record<
      string,
      Array<{ id: string; user: string; text: string; timestamp: Date }>
    >
  >({});

  useEffect(() => {
    (async () => {
      loadData();
    })();
  }, []);

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

  const loadData = async () => {
    await getAllEvents();
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = events;

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

    const now = new Date();
    if (filterType === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.date) > now);
    } else if (filterType === "past") {
      filtered = filtered.filter((event) => new Date(event.date) <= now);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (filterType === "upcoming") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    setFilteredEvents(filtered);
  };

  const isUserRegistered = (eventId: string) => {
    if (!user) return false;
    if (optimisticRegistrations[eventId]) {
      return optimisticRegistrations[eventId].isRegistered;
    }
    return registrations.some(
      (reg) => reg.eventId === eventId && reg.userId === user?.id
    );
  };

  const getEventRegistrationCount = (eventId: string) => {
    if (optimisticRegistrations[eventId]) {
      return optimisticRegistrations[eventId].count;
    }
    return registrations.filter((reg) => reg.eventId === eventId).length;
  };

  const isEventFull = (event: Event) => {
    if (!event.maxParticipants) return false;
    const registrationCount = getEventRegistrationCount(event.id);
    return registrationCount >= event.maxParticipants;
  };

  const toggleCardExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleDescriptionExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const isDescriptionLong = (description: string) => {
    return description && description.length > 150;
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;

    setProcessingEventId(eventId);

    const currentCount = getEventRegistrationCount(eventId);
    setOptimisticRegistrations((prev) => ({
      ...prev,
      [eventId]: { isRegistered: true, count: currentCount + 1 },
    }));

    try {
      const sucesss = await registerUserForEvent(eventId);
      if (sucesss) {
        setJustRegistered((prev) => new Set([...prev, eventId]));
        setMessage({
          type: "success",
          text: "Successfully registered for the event! 🎉",
        });
      }
    } catch (error) {
      setOptimisticRegistrations((prev) => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
      setMessage({
        type: "error",
        text: "Failed to register for event. Please try again.",
      });
    } finally {
      setProcessingEventId(null);
      // setTimeout(() => {
      //   setOptimisticRegistrations((prev) => {
      //     const newState = { ...prev }
      //     delete newState[eventId]
      //     return newState
      //   })
      // }, 1000)
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) return;

    setProcessingEventId(eventId);

    const currentCount = getEventRegistrationCount(eventId);
    setOptimisticRegistrations((prev) => ({
      ...prev,
      [eventId]: { isRegistered: false, count: Math.max(0, currentCount - 1) },
    }));

    try {
      const success = await unregisterUserFromEvent(eventId);
      if (success) {
        // setJustUnregistered((prev) => new Set([...prev, eventId]))
        setMessage({
          type: "success",
          text: "Successfully unregistered from the event.",
        });
      }

      // setTimeout(() => {
      //   setJustUnregistered((prev) => {
      //     const newSet = new Set(prev)
      //     newSet.delete(eventId)
      //     return newSet
      //   })
      // }, 2000)
    } catch (error) {
      setOptimisticRegistrations((prev) => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
      setMessage({
        type: "error",
        text: "Failed to unregister from event. Please try again.",
      });
    } finally {
      setProcessingEventId(null);
      // setTimeout(() => {
      //   setOptimisticRegistrations((prev) => {
      //     const newState = { ...prev }
      //     delete newState[eventId]
      //     return newState
      //   })
      // }, 1000)
    }
  };

  const toggleLike = (eventId: string) => {
    const newLiked = new Set(likedEvents);
    const newLikes = { ...eventLikes };

    if (newLiked.has(eventId)) {
      newLiked.delete(eventId);
      newLikes[eventId] = (newLikes[eventId] || 0) - 1;
    } else {
      newLiked.add(eventId);
      newLikes[eventId] = (newLikes[eventId] || 0) + 1;
    }

    setLikedEvents(newLiked);
    setEventLikes(newLikes);
  };

  const shareEvent = async (event: Event, platform?: string) => {
    const url = `${window.location.origin}/events/${event.id}`;
    const text = `Check out this event: ${event.Name}`;

    if (platform === "copy") {
      await navigator.clipboard.writeText(url);
      setMessage({ type: "success", text: "Link copied to clipboard!" });
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`
      );
    }
    setShowShareMenu(null);
  };

  const addComment = (eventId: string) => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: Date.now().toString(),
      user: user.name,
      text: newComment.trim(),
      timestamp: new Date(),
    };

    setEventComments((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), comment],
    }));
    setNewComment("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-slate-600">
            Loading events...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Discover Events
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl leading-relaxed">
                Join exciting events, connect with your community, and make a
                difference together
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/30">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white/30">
                      <AvatarFallback className="bg-blue-500 text-white text-sm sm:text-lg font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-white text-sm sm:text-base">
                      {user.name}
                    </span>
                  </div>
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => router.push("/auth/user/login")}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push("/auth/user/register")}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {message && (
          <div className="mb-8">
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={
                message.type === "success"
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : ""
              }
            >
              <AlertDescription className="text-base font-medium">
                {message.text}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Card className="mb-6 sm:mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                  className={`${
                    filterType === "all"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-slate-200 hover:bg-blue-50 hover:text-blue-700"
                  } text-sm sm:text-base py-2 sm:py-3`}
                >
                  All Events
                </Button>
                <Button
                  variant={filterType === "upcoming" ? "default" : "outline"}
                  onClick={() => setFilterType("upcoming")}
                  size="sm"
                  className={`${
                    filterType === "upcoming"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-slate-200 hover:bg-blue-50 hover:text-blue-700"
                  } text-sm sm:text-base py-2 sm:py-3`}
                >
                  Upcoming
                </Button>
                <Button
                  variant={filterType === "past" ? "default" : "outline"}
                  onClick={() => setFilterType("past")}
                  size="sm"
                  className={`${
                    filterType === "past"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-slate-200 hover:bg-blue-50 hover:text-blue-700"
                  } text-sm sm:text-base py-2 sm:py-3`}
                >
                  Past Events
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12 sm:py-20">
              <div className="max-w-md mx-auto space-y-4 sm:space-y-6 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {events.length === 0
                    ? "No events available yet"
                    : searchTerm || filterType !== "all"
                    ? "No events match your criteria"
                    : "No events found"}
                </h3>
                <p className="text-slate-600 text-base sm:text-lg">
                  {events.length === 0
                    ? "Check back soon for exciting events!"
                    : "Try adjusting your search or filter settings."}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const registrationCount = getEventRegistrationCount(event.id);
              const isRegistered = isUserRegistered(event.id);
              const isFull = isEventFull(event);
              const isUpcoming = new Date(event.date) > new Date();
              const isPast = new Date(event.date) <= new Date();
              const isProcessing = processingEventId === event.id;
              const isExpanded = expandedCards.has(event.id);
              const isDescriptionExpanded = expandedDescriptions.has(event.id);
              const needsDescriptionToggle =
                event.description && isDescriptionLong(event.description);
              const isLiked = likedEvents.has(event.id);
              const likes =
                eventLikes[event.id] || Math.floor(Math.random() * 50) + 5;
              const comments = eventComments[event.id] || [];

              return (
                <Card
                  key={event.id}
                  className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-[1.02] overflow-hidden animate-fade-in-up"
                  onClick={() => setFullScreenEvent(event)}
                >
                  <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                          {event.Name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 sm:mt-3">
                          <div className="p-1 bg-blue-100 rounded-lg">
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-slate-700 text-sm sm:text-base">
                            {event.serviceProvider.name}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1 sm:gap-2 items-end">
                        {isRegistered && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs">
                            <UserCheck className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                        {isFull && !isRegistered && (
                          <Badge
                            variant="destructive"
                            className="font-semibold text-xs"
                          >
                            Full
                          </Badge>
                        )}
                        {isPast && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 font-semibold text-xs"
                          >
                            Past Event
                          </Badge>
                        )}
                        {isUpcoming && !isFull && !isRegistered && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold text-xs">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-sm sm:text-base">
                          {new Date(event.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                        </div>
                        <span className="line-clamp-1 font-medium text-sm sm:text-sm">
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <span>
                          <span
                            className={`font-bold text-blue-700 text-base transition-all duration-300 ${
                              optimisticRegistrations[event.id]
                                ? "scale-110 text-green-600"
                                : ""
                            }`}
                          >
                            {event.currentParticipants}
                          </span>
                          <span className="text-slate-600 font-medium text-xs sm:text-sm">
                            {" "}
                            registered
                          </span>
                          {event.maxParticipants && (
                            <span className="text-slate-500 text-xs sm:text-sm">
                              {" "}
                              / {event.maxParticipants} max
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 sm:p-5 rounded-xl border-l-4 border-blue-300 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                                Event Description
                              </h4>
                              <p
                                className={`text-slate-700 leading-relaxed text-sm ${
                                  !isDescriptionExpanded &&
                                  needsDescriptionToggle
                                    ? "line-clamp-3"
                                    : ""
                                }`}
                              >
                                {event.description}
                              </p>
                              {needsDescriptionToggle && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDescriptionExpansion(event.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-2 group/btn"
                                >
                                  <span>
                                    {isDescriptionExpanded
                                      ? "Show Less"
                                      : "Show More"}
                                  </span>
                                  {isDescriptionExpanded ? (
                                    <ChevronUp className="h-3 w-3 group-hover/btn:translate-y-[-1px] transition-transform" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 group-hover/btn:translate-y-[1px] transition-transform" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Organizer Details
                          </h4>
                          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {event.serviceProvider.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{event.serviceProvider.email}</span>
                            </div>
                          </div>
                        </div>

                        {event.ConfirmedUsers &&
                          event.ConfirmedUsers.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                Confirmed Participants (
                                {event.ConfirmedUsers.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {event.ConfirmedUsers.slice(0, 6).map(
                                  (confirmedUser) => (
                                    <div
                                      key={confirmedUser.id}
                                      className="flex items-center gap-2 bg-accent/10 rounded-full px-3 py-1"
                                    >
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                                          {confirmedUser.name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">
                                        {confirmedUser.name}
                                      </span>
                                    </div>
                                  )
                                )}
                                {event.ConfirmedUsers.length > 6 && (
                                  <div className="flex items-center justify-center bg-muted rounded-full px-3 py-1">
                                    <span className="text-sm text-muted-foreground">
                                      +{event.ConfirmedUsers.length - 6} more
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            Created:{" "}
                            {new Date(event.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            Updated:{" "}
                            {new Date(event.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-3 sm:pt-4">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardExpansion(event.id);
                        }}
                        className="w-full justify-between bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <span className="font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {isExpanded
                            ? "Hide Event Details"
                            : "View Event Details"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4">
                          <button
                            onClick={(e) =>{e.stopPropagation() ;toggleLike(event.id)}}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ${
                              isLiked
                                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                                : "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                            }`}
                          >
                            <Heart
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                isLiked ? "fill-current" : ""
                              }`}
                            />
                            <span className="font-semibold text-sm">
                              {likes}
                            </span>
                          </button>

                          <button
                            onClick={() => setFullScreenEvent(event)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-300"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-semibold text-sm">
                              {comments.length}
                            </span>
                          </button>
                        </div>

                        <div className="relative flex justify-center sm:justify-end">
                          <button
                            onClick={(e) =>{
                              e.stopPropagation();
                              setShowShareMenu(
                                showShareMenu === event.id ? null : event.id
                              )
                            }}
                            className="p-2 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-600 transition-all duration-300"
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>

                          {showShareMenu === event.id && (
                            <div className="absolute right-0 sm:right-0 top-12 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-10 min-w-[180px] sm:min-w-[200px]">
                              <button
                                onClick={() => shareEvent(event, "copy")}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <Copy className="h-4 w-4 text-slate-600" />
                                <span className="font-medium">Copy Link</span>
                              </button>
                              <button
                                onClick={() => shareEvent(event, "twitter")}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <Twitter className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">
                                  Share on Twitter
                                </span>
                              </button>
                              <button
                                onClick={() => shareEvent(event, "facebook")}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <Facebook className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">
                                  Share on Facebook
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isPast ? (
                        <Button
                          disabled
                          className="w-full bg-slate-200 text-slate-500 font-semibold text-sm sm:text-base py-2 sm:py-3"
                        >
                          Event Ended
                        </Button>
                      ) : !user ? (
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg text-sm sm:text-base py-2 sm:py-3"
                          onClick={(e) =>{e.stopPropagation(); router.push("/auth/user/login")}}
                        >
                          Login to Register
                        </Button>
                      ) : isRegistered ? (
                        <div className="space-y-2 sm:space-y-3">
                          <Button
                            disabled
                            className={`w-full font-semibold text-sm sm:text-base py-2 sm:py-3 transition-all duration-500 ${
                              justRegistered.has(event.id)
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            {justRegistered.has(event.id)
                              ? "Registration Confirmed! ✨"
                              : "You're Registered!"}
                          </Button>
                          <Button
                            variant="outline"
                            className={`w-full font-semibold bg-transparent text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${
                              justUnregistered.has(event.id)
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 animate-pulse"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnregister(event.id);
                            }}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current"></div>
                                Unregistering...
                              </div>
                            ) : justUnregistered.has(event.id) ? (
                              "Unregistered Successfully ✓"
                            ) : (
                              "Unregister"
                            )}
                          </Button>
                        </div>
                      ) : isFull ? (
                        <Button
                          disabled
                          className="w-full bg-slate-200 text-slate-500 font-semibold text-sm sm:text-base py-2 sm:py-3"
                        >
                          Event Full
                        </Button>
                      ) : (
                        <Button
                          className={`w-full font-semibold shadow-lg text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${
                            isProcessing
                              ? "bg-gradient-to-r from-blue-400 to-purple-400"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02]"
                          } text-white`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(event.id);
                          }}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                              <span className="animate-pulse">
                                Registering...
                              </span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-2">
                              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                              Register for Event
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {fullScreenEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 pr-4">
                {fullScreenEvent.Name}
              </h2>
              <button
                onClick={() => setFullScreenEvent(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span className="font-semibold text-sm sm:text-base">
                        {new Date(fullScreenEvent.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                      <span className="font-medium text-sm sm:text-base">
                        {new Date(fullScreenEvent.date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      <span className="font-medium text-sm sm:text-base">
                        {fullScreenEvent.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      <span className="font-medium text-sm sm:text-base">
                        {fullScreenEvent.currentParticipants} registered
                        {fullScreenEvent.maxParticipants &&
                          ` / ${fullScreenEvent.maxParticipants} max`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl">
                      <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        Organized by
                      </h3>
                      <p className="font-medium text-slate-700 text-sm sm:text-base">
                        {fullScreenEvent.serviceProvider.name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {fullScreenEvent.serviceProvider.email}
                      </p>
                    </div>
                  </div>
                </div>

                {fullScreenEvent.description && (
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Sparkles className="h-4 w-4" />
                      About This Event
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                      {fullScreenEvent.description}
                    </p>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base sm:text-lg">
                    <MessageCircle className="h-4 w-4" />
                    Comments ({(eventComments[fullScreenEvent.id] || []).length}
                    )
                  </h3>

                  {user && (
                    <div className="flex gap-2 sm:gap-3">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && addComment(fullScreenEvent.id)
                          }
                          className="flex-1 text-sm sm:text-base"
                        />
                        <Button
                          onClick={() => addComment(fullScreenEvent.id)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-3"
                        >
                          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {(eventComments[fullScreenEvent.id] || []).map(
                      (comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm">
                              {comment.user.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-slate-800">
                                {comment.user}
                              </span>
                              <span className="text-xs text-slate-500">
                                {comment.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
