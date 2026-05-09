"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth } from "@/lib/api";

export function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getAuth()) router.replace("/login");
    else setReady(true);
  }, [router]);
  if (!ready) return <div className="text-sm text-muted">Loading...</div>;
  return <>{children}</>;
}

