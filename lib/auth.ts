import type { User, UserRole } from "@/types"

const USERS_KEY = "multi_role_users"
const CURRENT_USER_KEY = "current_user"

// Initialize with default admin user
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY)
  if (!existingUsers) {
    const defaultAdmin: User = {
      id: "admin-1",
      email: "admin@example.com",
      password: "admin123",
      name: "System Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]))
  }
}

export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []
  initializeUsers()
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const registerUser = (
  email: string,
  password: string,
  name: string,
  role: UserRole,
): { success: boolean; message: string; user?: User } => {
  const users = getUsers()

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return { success: false, message: "User with this email already exists" }
  }

  const newUser: User = {
    id: `${role}-${Date.now()}`,
    email,
    password,
    name,
    role,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  return { success: true, message: "Registration successful", user: newUser }
}

export const loginUser = (email: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return { success: false, message: "Invalid email or password" }
  }

  // Store current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))

  return { success: true, message: "Login successful", user }
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const currentUser = localStorage.getItem(CURRENT_USER_KEY)
  return currentUser ? JSON.parse(currentUser) : null
}

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
}
