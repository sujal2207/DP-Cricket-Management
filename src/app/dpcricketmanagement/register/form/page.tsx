import { Shield, AlertCircle, CalendarDays } from "lucide-react";
import { PublicRegistrationForm } from "@/components/forms/PublicRegistrationForm";
import {
  RegistrationClosedNotice,
  RegistrationOpenUntilNotice,
} from "@/components/forms/RegistrationWindowNotice";
import { TournamentLogo } from "@/components/forms/public/TournamentLogo";
import { DeveloperCredit } from "@/components/layout/DeveloperCredit";
import { RegistrationBrandingProvider } from "@/components/forms/RegistrationBrandingProvider";
import { getRegistrationBranding } from "@/lib/registration-branding";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicRegisterFormPage() {
  const branding = await getRegistrationBranding();

  return (
    <RegistrationBrandingProvider branding={branding}>
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <TournamentLogo size="sm" priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
              {branding.organizationNameGu}
            </p>
            <p className="text-xs text-slate-500 sm:text-sm">
              {branding.formSubtitleGu}
            </p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#2e004b] bg-gradient-to-br from-[#1a0033] via-[#2e004b] to-[#1a0033]">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-12">
          <TournamentLogo size="lg" className="mx-auto mb-6" priority />

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-100 sm:text-sm">
            <Shield className="h-4 w-4 shrink-0 text-amber-300" />
            {branding.tournamentYear} · {branding.tournamentShortGu}
          </div>

          <h1 className="mx-auto max-w-2xl text-balance text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl sm:leading-snug md:text-[1.65rem] md:leading-snug lg:max-w-3xl lg:text-3xl lg:leading-snug">
            {branding.tournamentTitleGu}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {branding.heroDescriptionGu}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {!branding.isRegistrationOpen ? (
          <RegistrationClosedNotice closesOn={branding.registrationClosesOn} />
        ) : (
          <>
            {branding.registrationClosesOn && (
              <RegistrationOpenUntilNotice
                closesOn={branding.registrationClosesOn}
              />
            )}
            <PublicRegistrationForm />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950 sm:items-start sm:px-5 sm:py-4">
            <CalendarDays
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              aria-hidden
            />
            <p className="text-center sm:text-left">
              {branding.availabilityNoticeGu}
            </p>
          </div>

          <div className="flex gap-3 rounded-xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-orange-50 px-4 py-4 text-sm font-medium leading-relaxed text-rose-950 shadow-sm sm:items-start sm:px-5 sm:py-4">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
              aria-hidden
            />
            <p className="text-center sm:text-left">{branding.feeNoticeGu}</p>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-5 sm:pt-6">
            <TournamentLogo size="sm" className="h-10 w-10 sm:h-11 sm:w-11" />
            <p className="text-center text-xs text-slate-500">
              © {new Date().getFullYear()} {branding.organizationNameGu}. સર્વાધિકાર
              સુરક્ષિત.
            </p>
            <DeveloperCredit variant="light" className="w-full max-w-2xl" />
          </div>
        </div>
      </footer>
    </RegistrationBrandingProvider>
  );
}
