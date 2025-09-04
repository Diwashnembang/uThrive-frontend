import { useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import { Event, EventRegistration, User } from "@/types";
import { useAuthStore } from "@/store/useStore";

export function useCreateEvent() {
  const { user: loggedUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]); 
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (events.length < 0) return;
    setRegistrations([]); // reset ddee repopulating
    events.forEach((event: Event) => {
      if (!event.ConfirmedUsers) return;
      event.ConfirmedUsers.forEach((user) => {
        setRegistrations((prevRegs) => [
          ...prevRegs,
          {
            id: `${event.id}-${user.id}`, // use event.id instead of data.event.id
            eventId: event.id,
            userId: user.id,
            registeredAt: new Date().toISOString(), // or use actual registration date if available
          },
        ]);
      });
      event.currentParticipants = event.ConfirmedUsers.length;
    });
    
  }, [events]);
  const createEvent = useCallback(async (newEvent: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "serviceProvider/postEvent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify(newEvent),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create event");
      }
      setEvents((prevEvents) => [...prevEvents, data.event]);    
    
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProviderEvents = useCallback(async () => {
    setLoading(true); 
    try{
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "serviceProvider/getEvents",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }
      setEvents(data.events || []);    
      setRegistrations(data.events.registrations || []);
      return { success: true, data }; 
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllEvents = useCallback(async () => {
    setLoading(true);
    try{
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "user/AllEvents",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }
      setEvents(data.events || []);  
       
      return { success: true, data }; 
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  //userId is sent in token 
  const registerUserForEvent = useCallback(async (eventId: string ) => {
    setLoading(true);
    try{
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `user/joinEvent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ eventId }),
        }
      );


      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register for event");
      }
      return { success: true, message: "Registration sucessfull" };
    }catch (err: any) {

    }
  }, []);

  //userId is sent in token
  const unregisterUserFromEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    try{
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `user/leaveEvent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ eventId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to unregister from event");
      }
      return { success: true, message: "Unregistration sucessfull" };
    }catch (err: any) {
      setError(err.message || "Something went wrong");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  },[])

  return { createEvent, loading, error, events, setEvents, getProviderEvents, getAllEvents, registerUserForEvent,registrations,setRegistrations,unregisterUserFromEvent };
}
