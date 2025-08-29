import { useState, useCallback } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

export function useServiceProviders() {
  const [loading, setLoading] = useState(false);
  const [unApprovedServiceProviders, setunApprovedServiceProviders] = useState<User[]>([]);
  const [approvedServiceProviders, setApprovedServiceProviders] = useState<User[]>([]);  
  const fetchunApprovedServiceProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "admin/unapprovedServiceProviders",
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
        setLoading(false);
        return {
          success: false,
          message: data.message || "Failed to fetch service providers",
        };
      }

      setunApprovedServiceProviders(data.unApprovedServiceProviders || []);
      setLoading(false);
      return { success: true, message: "Service providers fetched" };
    } catch (err) {
      setLoading(false);
      return { success: false, message: "Something went wrong" };
    }
  }, []);

  const fetchApprovedServieProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "admin/approvedServiceProviders",
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
        setLoading(false);
        return {
          success: false,
          message: data.message || "Failed to fetch service providers",
        };
      }

      setApprovedServiceProviders(data.approvedServiceProviders || []);
      setLoading(false);
      return { success: true, message: "Service providers fetched" };
    } catch (err) {
      setLoading(false);
      return { success: false, message: "Something went wrong" };
    }
  }, []);
  return { loading, unApprovedServiceProviders, fetchunApprovedServiceProviders,approvedServiceProviders,fetchApprovedServieProviders };
}
