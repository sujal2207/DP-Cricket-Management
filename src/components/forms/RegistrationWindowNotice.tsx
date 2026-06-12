import { CalendarOff } from "lucide-react";
import { gu } from "@/lib/translations/publicRegistrationGu";
import { formatCloseDateDisplay } from "@/lib/registration-window";

interface RegistrationClosedNoticeProps {
  closesOn: string | null;
}

export function RegistrationClosedNotice({
  closesOn,
}: RegistrationClosedNoticeProps) {
  const closeLabel = closesOn
    ? formatCloseDateDisplay(closesOn, "gu-IN")
    : null;

  return (
    <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <CalendarOff className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-red-950 sm:text-xl">
        {gu.registration.closedTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-900/90 sm:text-base">
        {gu.registration.closedMessage}
      </p>
      {closeLabel && (
        <p className="mt-4 text-xs font-medium text-red-800/80 sm:text-sm">
          ({closeLabel})
        </p>
      )}
    </div>
  );
}

interface RegistrationOpenUntilNoticeProps {
  closesOn: string;
}

export function RegistrationOpenUntilNotice({
  closesOn,
}: RegistrationOpenUntilNoticeProps) {
  const label = formatCloseDateDisplay(closesOn, "gu-IN");
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-950">
      {gu.registration.openUntil(label)}
    </div>
  );
}
