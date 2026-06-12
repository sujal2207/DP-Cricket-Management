"use client";

import { createContext, useContext } from "react";
import type { RegistrationBrandingData } from "@/lib/registration-branding-types";

const RegistrationBrandingContext =
  createContext<RegistrationBrandingData | null>(null);

export function RegistrationBrandingProvider({
  branding,
  children,
}: {
  branding: RegistrationBrandingData;
  children: React.ReactNode;
}) {
  return (
    <RegistrationBrandingContext.Provider value={branding}>
      {children}
    </RegistrationBrandingContext.Provider>
  );
}

export function useRegistrationBranding(): RegistrationBrandingData {
  const branding = useContext(RegistrationBrandingContext);
  if (!branding) {
    throw new Error("useRegistrationBranding must be used within provider");
  }
  return branding;
}
