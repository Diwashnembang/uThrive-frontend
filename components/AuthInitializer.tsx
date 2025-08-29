// components/AuthInitializer.jsx
'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useStore'
import Cookie from 'js-cookie'; 
import { User, UserRole } from '@/types'
import { jwtDecode } from 'jwt-decode'
import type { TokenPayload } from '@/store/useStore'


import type { ReactNode } from 'react';

export default function AuthInitializer({ children }: { children: ReactNode }) {
  const {setUser} = useAuthStore()

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

  return children
}