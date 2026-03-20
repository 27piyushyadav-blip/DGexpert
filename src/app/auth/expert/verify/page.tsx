"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    
    // Redirect to correct frontend route with same token
    if (token) {
      router.replace(`/verify?token=${token}`);
    } else {
      // No token, redirect to login
      router.replace("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-dvh w-full bg-white items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-zinc-600">Redirecting to verification page...</p>
      </div>
    </div>
  );
}

export default function AuthExpertVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh w-full bg-white items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
