"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import { isAuthenticated as checkIsAuthenticated } from "@/client/api/auth";

export default function PlatformLayout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on client side only
    const checkAuth = () => {
      const authenticated = checkIsAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      if (!authenticated) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50/50">
      {/* 1. Header is rendered ONCE here for all platform pages */}
      <Header />
      
      {/* 2. Children will be either the Dashboard Layout or Chat Pages */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}