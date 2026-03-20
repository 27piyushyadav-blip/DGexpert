"use client";

/*
 * File: src/app/(platform)/(standalone)/chat/page.tsx
 * Expert Chat Page — fetches real conversations from backend
 */

import ChatClient from "@/components/chat/ChatClient";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const authUser = localStorage.getItem("auth_user");

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Parse current user
    let user: UserData;
    try {
      const parsed = JSON.parse(authUser || "{}");
      user = {
        ...parsed,
        id: parsed.id || "unknown",
        role: "expert",
        isOnline: true,
      };
    } catch {
      user = { id: "unknown", name: "Expert", email: "", role: "expert", isOnline: true };
    }
    setCurrentUser(user);

    // Fetch conversations
    fetch(`${API_BASE}/chat/conversations?userType=expert`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <div className="p-8 text-center">Please log in to use chat.</div>;
  }

  return (
    <ChatClient
      initialConversations={conversations}
      currentUser={currentUser}
    />
  );
}
