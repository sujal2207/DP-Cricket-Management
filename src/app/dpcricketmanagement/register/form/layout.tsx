import type { Metadata } from "next";
import { getRegistrationBranding } from "@/lib/registration-branding";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getRegistrationBranding();
  return {
    title: `${branding.tournamentShortGu} — ક્રિકેટર નોંધણી`,
    description: branding.formSubtitleGu,
  };
}

export default function PublicRegisterFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      lang="gu"
      className="gujarati-page min-h-screen bg-slate-50 text-slate-900"
      style={{ colorScheme: "light" }}
    >
      {children}
    </div>
  );
}
