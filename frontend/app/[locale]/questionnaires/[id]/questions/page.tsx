"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function QuestionnaireQuestionsRedirect() {
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const id = typeof params?.id === "string" ? params.id : "";

  useEffect(() => {
    if (!id) return;
    router.replace(`/${locale}/questions?questionnaireId=${id}`);
  }, [id, locale, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
      {tCommon("loading")}
    </div>
  );
}
