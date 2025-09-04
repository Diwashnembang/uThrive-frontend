"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuthStore } from "@/store/useStore"
import { useEffect } from "react"
import Cookie from 'js-cookie';
import { User, UserRole } from "@/types"
import { jwtDecode } from "jwt-decode"
import type { TokenPayload } from "@/store/useStore"

export default function HomePage() {
  const { user, logout, setUser} = useAuthStore()

  useEffect(() => {

    let token : string | undefined = Cookie.get("token")
    if(token){
      const userInfo = jwtDecode<TokenPayload>(token);
      const user : User= {
        id : userInfo.id,
        email :  userInfo.sub,
        name: userInfo.name,
        role: userInfo.role as UserRole,
      }
      setUser(user); 
    }
  }, [])

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>Manage users, service providers, and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {user.role === "serviceProvider" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Events</CardTitle>
                  <CardDescription>Create and manage your events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/provider/events">
                    <Button className="w-full">Manage Events</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {user.role === "user" && (
              <Card>
                <CardHeader>
                  <CardTitle>Browse Events</CardTitle>
                  <CardDescription>Find and join exciting events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/events">
                    <Button className="w-full">Browse Events</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Event Platform</h1>
          <p className="mt-2 text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Browse and join events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/auth/user/login">
                <Button className="w-full">Login as User</Button>
              </Link>
              <Link href="/auth/user/register">
                <Button variant="outline" className="w-full bg-transparent">
                  Register as User
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Providers</CardTitle>
              <CardDescription>Create and manage events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/auth/provider/login">
                <Button className="w-full">Login as Provider</Button>
              </Link>
              <Link href="/auth/provider/register">
                <Button variant="outline" className="w-full bg-transparent">
                  Register as Provider
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Manage the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/admin/login">
                <Button className="w-full">Admin Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
