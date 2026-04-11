"use client";

/*
 * File: src/app/(platform)/(standalone)/chat/page.tsx
 * Expert Chat Page — fetches real conversations from backend
 */

import ChatClient from "@/components/chat/ChatClient";
import { useEffect, useState } from "react";
import { apiClient } from "@/client/api/api-client";

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
    const authUser = localStorage.getItem("auth_user");

    // Parse current user
    let user: UserData;
    try {
      const parsed = JSON.parse(authUser || "{}");
      console.log("🔥 Expert Page - Raw auth_user data:", authUser);
      console.log("🔥 Expert Page - Parsed user data:", parsed);
      
      user = {
        ...parsed,
        id: parsed.id || parsed._id || parsed.expertId || "unknown", // Try multiple ID fields
        role: "expert",
        isOnline: true,
      };
      
      console.log("🔥 Expert Page - Final user object:", user);
    } catch {
      user = { id: "unknown", name: "Expert", email: "", role: "expert", isOnline: true };
    }
    setCurrentUser(user);

    // Fetch conversations
    apiClient<any>(`${API_BASE}/chat/conversations?userType=expert`)
      .then((data) => {
        console.log("🔥 Expert Page - Conversations loaded:", data.conversations);
        
        // If user ID is still "unknown", try to get it from conversations
        if (user.id === "unknown" && data.conversations && data.conversations.length > 0) {
          const firstConversation = data.conversations[0];
          console.log("🔥 Expert Page - First conversation:", firstConversation);
          
          // For expert, the ID should be in expertId field
          if ((firstConversation as any).expertId) {
            user.id = (firstConversation as any).expertId;
            console.log("🔥 Expert Page - Updated user ID from conversation expertId:", user.id);
            setCurrentUser(user); // Update with correct ID
          }
        }
        
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
