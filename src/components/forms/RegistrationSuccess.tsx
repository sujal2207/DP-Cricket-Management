"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TournamentLogo } from "@/components/forms/public/TournamentLogo";
import { CAPTAINCY_INTEREST } from "@/lib/constants";
import { gu, getCategoryLabel } from "@/lib/translations/publicRegistrationGu";
import { useRegistrationBranding } from "@/components/forms/RegistrationBrandingProvider";
import { downloadRegistrationSlip } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";

export interface RegistrationResult {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  address: string;
  contact_number_1: string;
  contact_number_2?: string;
  age?: number;
  cricket_categories: string[];
  capacity_roles: string[];
  jersey_size?: string;
  jersey_number?: number;
  jersey_name?: string;
  interested_in_captaincy?: boolean;
  created_at?: string;
}

interface RegistrationSuccessProps {
  data: RegistrationResult;
  onReset: () => void;
}

export function RegistrationSuccess({ data, onReset }: RegistrationSuccessProps) {
  const branding = useRegistrationBranding();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const autoDownloadStarted = useRef(false);
  const isCaptaincyInterested =
    data.interested_in_captaincy ?? data.capacity_roles.includes(CAPTAINCY_INTEREST);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadRegistrationSlip(
        {
          id: data.id,
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          address: data.address,
          contact_number_1: data.contact_number_1,
          contact_number_2: data.contact_number_2,
          age: data.age,
          cricket_categories: data.cricket_categories,
          capacity_roles: data.capacity_roles,
          jersey_size: data.jersey_size,
          jersey_number: data.jersey_number,
          jersey_name: data.jersey_name,
          created_at: data.created_at,
        },
        branding
      );
    } catch {
      setDownloadError(gu.success.receiptDownloadFailed);
    } finally {
      setDownloading(false);
    }
  }, [branding, data]);

  useEffect(() => {
    if (autoDownloadStarted.current) return;
    autoDownloadStarted.current = true;

    const storageKey = `receipt-auto-${data.id}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        await downloadRegistrationSlip(
          {
            id: data.id,
            first_name: data.first_name,
            middle_name: data.middle_name,
            last_name: data.last_name,
            address: data.address,
            contact_number_1: data.contact_number_1,
            contact_number_2: data.contact_number_2,
            age: data.age,
            cricket_categories: data.cricket_categories,
            capacity_roles: data.capacity_roles,
            jersey_size: data.jersey_size,
            jersey_number: data.jersey_number,
            jersey_name: data.jersey_name,
            created_at: data.created_at,
          },
          branding
        );
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // Manual download remains available via the button.
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [branding, data]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-4">
        <TournamentLogo size="md" />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{gu.success.title}</h2>
      <p className="mt-2 text-sm text-slate-600 sm:text-base">
        {branding.tournamentShortGu} માં નોંધણી કરવા બદલ આભાર.
      </p>
      <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-rose-900 sm:text-sm">
        {branding.feeNoticeGu}
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-left sm:p-6">
        <dl className="space-y-4">
          <SuccessRow
            label={gu.success.registrationId}
            value={data.id.slice(-8).toUpperCase()}
          />
          <SuccessRow label={gu.success.name} value={data.full_name} />
          {data.age != null && (
            <SuccessRow label={gu.success.age} value={String(data.age)} />
          )}
          <SuccessRow label={gu.success.mobile} value={data.contact_number_1} />
          {data.jersey_size && data.jersey_number != null && (
            <>
              <SuccessRow label={gu.success.jerseySize} value={data.jersey_size} />
              <SuccessRow
                label={gu.success.jerseyNumber}
                value={String(data.jersey_number)}
              />
            </>
          )}
          {data.jersey_name && (
            <SuccessRow label={gu.success.jerseyName} value={data.jersey_name} />
          )}
          <div>
            <dt className="text-sm font-medium text-slate-500">{gu.success.categories}</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {data.cricket_categories.map((cat) => (
                <Badge key={cat} variant="success">
                  {getCategoryLabel(cat)}
                </Badge>
              ))}
            </dd>
          </div>
          <SuccessRow
            label={gu.success.captaincy}
            value={isCaptaincyInterested ? gu.success.yes : gu.success.no}
          />
          {data.created_at && (
            <SuccessRow label={gu.pdf.date} value={formatDate(data.created_at)} />
          )}
        </dl>
      </div>

      {downloadError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800"
        >
          {downloadError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onReset} variant="outline" size="lg" className="w-full sm:w-auto">
          <RotateCcw className="h-4 w-4" />
          {gu.success.submitAnother}
        </Button>
        <Button
          onClick={handleDownload}
          size="lg"
          className="w-full sm:w-auto"
          disabled={downloading}
        >
          <Download className="h-4 w-4" />
          {downloading ? gu.success.downloadingReceipt : gu.success.downloadSlip}
        </Button>
      </div>
    </div>
  );
}

function SuccessRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
