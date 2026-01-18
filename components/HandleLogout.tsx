"use client";
import { useRouter } from "next/navigation";

export const useHandleLogout = () => {
  const router = useRouter();

  return async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt_token: localStorage.getItem("access_token"),
        }),
      });
    } catch (err) {
      console.error("Logout request failed");
    } finally {
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      localStorage.setItem("theme", theme || "light");

      router.replace("/login");
    }
  };
};
