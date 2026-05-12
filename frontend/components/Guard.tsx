"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";

export function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Common");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getAuth()) router.replace(`/${locale}/login`);
    else setReady(true);
  }, [locale, router]);
  if (!ready) return <div className="text-sm text-muted">{t("loading")}</div>;
  return <>{children}</>;
}
