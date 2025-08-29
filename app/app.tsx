// pages/_app.tsx
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { User, UserRole } from "@/types";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@/store/useStore";
import Cookie from "js-cookie";
import { useAuthStore } from "@/store/useStore";

function MyApp({ Component, pageProps }: AppProps) {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token: string | undefined = Cookie.get("token");

    if (token) {
      const userInfo = jwtDecode<TokenPayload>(token);
      const user: User = {
        id: userInfo.id,
        email: userInfo.sub,
        name: userInfo.name,
        role: userInfo.role as UserRole,
      };
      setUser(user);
    }

    setLoading(false); // done checking cookie
  }, [setUser]);

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  return <Component {...pageProps} />;
}

export default MyApp;
