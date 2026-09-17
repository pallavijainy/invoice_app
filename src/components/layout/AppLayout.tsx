"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/utils/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

interface UserInfo {
  email?: string;
  companyName?: string;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: "User",
    companyName: "Company",
  });

  useEffect(() => {
    const token = getToken();
    const logoutParam = new URLSearchParams(window.location.search).get(
      "logout"
    );

    if (logoutParam === "true") {
      removeToken();
      window.location.href = "/login";
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserInfo({
        email: payload.email || "User",
        companyName: payload.companyName || "Company",
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error decoding token:", error);
      removeToken();
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar companyName={userInfo.companyName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userEmail={userInfo.email}
          companyName={userInfo.companyName}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
