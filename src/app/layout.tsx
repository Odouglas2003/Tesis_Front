
import type { Metadata } from "next";
import "./globals.css";
import ThemeProviderClient from "./ThemeProviderClient";
import { UserProvider } from "./UserContext";
import { ProjectSuggestionProvider } from "@/context/ProjectSuggestionContext";
import Assistant from "../components/Assistant";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export const metadata: Metadata = {
  title: "Tesis",
  description: "Sistema de gestión inteligente de equipos",
  icons: {
    icon: "/icon.svg",
  },
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <AppRouterCacheProvider>
          <UserProvider>
            <ProjectSuggestionProvider>
              <ThemeProviderClient>{children}</ThemeProviderClient>
            </ProjectSuggestionProvider>
          </UserProvider>
          <Assistant />
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
