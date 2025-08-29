import {create } from 'zustand'
import { User, UserRole } from '../types'
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export interface TokenPayload {
    id: string;
  sub: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}
interface  AuthStoreState{
  user: User | null
    setUser: (user: User | null) => void;  
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    BusinessName?: string,
    Phone?: string,
    Address?: string,
    description?: string
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

interface adminState{
    alluser : User[] | null
    allServieProvider : User[] | null
    allEvents : any[] | null
    allUnapprovedServiceProvider : User[] | null
    setAllUser : (users: User[] | null) => void
    setAllServiceProvider : () => Promise<{ success: boolean; message: string }>
    loading : boolean
}
export const useAdminStore = create<adminState>((set) => ({
    alluser: null,
    allServieProvider: null,
    allEvents: null,
    allUnapprovedServiceProvider: null,
    loading: false,
    setAllUser: (users: User[] | null) => set({ alluser: users }),
    setAllServiceProvider: async () => {
        // Placeholder implementation, replace with actual logic as needed
            set({ loading: true });
            try {
            const res = await fetch( process.env.NEXT_PUBLIC_API_URL+ 'admin/unapprovedServiceProviders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });
            const data = await res.json();
            if (!res.ok) {
                set({ loading: false });
                return { success: false, message: data.message || "Failed to fetch service providers" };
            }
            set({ allServieProvider: data.serviceProviders, loading: false });
            return { success: true, message: "Service providers fetched" };
            } catch (err: unknown) {
            set({ loading: false });
            return { success: false, message: "Something went wrong" };
            }
        return { success: true, message: "Service providers set" };
    }
}));
export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  loading: false,
    setUser:(user: User | null) => set({ user }),
  login: async (email: string, password: string, role : UserRole): Promise<{ success: boolean; message: string }> => {
    set({ loading: true });
    try {
      // Replace this with your real API call
      const res = await fetch( process.env.NEXT_PUBLIC_API_URL+ role + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ loading: false });
        return { success: false, message: data.message || "Login failed" };
      }
      if(!data.token){
        set({ loading: false });
        return { success: false, message: "Login failed" };
      }
      const userInfo = jwtDecode<TokenPayload>(data.token);
      Cookies.set('token', data.token, { expires: new Date(userInfo.exp )});

      if (!userInfo) {
        set({ loading: false });
        return { success: false, message: "Login failed" };
      }
      const user: User = {
        id : userInfo.id,
        email: userInfo.sub,
        name: userInfo.name,
        role: userInfo.role as UserRole,
      };
      set({ user, loading: false });
      return { success: true, message: "Login successful" };
    } catch (err: unknown) {
      set({ loading: false });
      return { success: false, message: "Something went wrong" };
    }
  },
register: async (
  email: string,
  password: string,
  name: string,
  role: UserRole,
  BusinessName?: string,
  Phone?: string,
    Address?: string,
    description?: string
): Promise<{ success: boolean; message: string }> => {
  set({ loading: true });
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL+role + '/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, businessName:BusinessName, phone:Phone,address:Address, description }), 
    });

    const data = await res.json();

    if (!res.ok) {
      set({ loading: false });
      return { success: false, message: data.message || "Signup failed" };
    }
     if(!data.token){
        set({ loading: false });
        return { success: false, message: "Login failed" };
      }
      const userInfo = jwtDecode<TokenPayload>(data.token);
      Cookies.set('token', data.token, { expires: new Date (userInfo.exp)});
      if (!userInfo) {
        set({ loading: false });
        return { success: false, message: "Login failed" };
      }
      const user: User = {
        id: userInfo.id,
        email: email,
        name: userInfo.name,
        role: userInfo.role as UserRole,
        BusinessName,
        Phone,
        Address,
        description
      };


    set({ user, loading: false });
    return { success: true, message: "Signup successful" };
  } catch (err: unknown) {
    set({ loading: false });
    return { success: false, message: "Something went wrong" };
  }
},



  logout: () => {
    set({ user: null });
  },
}));