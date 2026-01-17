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

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
