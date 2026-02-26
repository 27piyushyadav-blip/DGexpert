// "use client";

// import { SessionProvider } from "next-auth/react";

// export function Providers({ children }) {
//   return (
//     <SessionProvider>
//       {children}
//     </SessionProvider>
//   );
// }

"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
