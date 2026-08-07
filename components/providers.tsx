"use client";

import { VoteProvider } from "@/context/VoteContext";
import { SubmissionsProvider } from "@/context/SubmissionsContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { ThemeModeProvider } from "@/context/ThemeModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <VoteProvider>
        <SubmissionsProvider>
          <SiteConfigProvider>{children}</SiteConfigProvider>
        </SubmissionsProvider>
      </VoteProvider>
    </ThemeModeProvider>
  );
}
