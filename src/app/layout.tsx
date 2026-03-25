
import type { Metadata } from "next";
import "./globals.css";
import ThemeProviderClient from "./ThemeProviderClient";
import { UserProvider } from "./UserContext";
import { ProjectSuggestionProvider } from "@/context/ProjectSuggestionContext";
import RubikoAssistant from "../components/Rubiko";

export const metadata: Metadata = {
  title: "Rubik",
  description: "rubik",
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
        <UserProvider>
          <ProjectSuggestionProvider>
            <ThemeProviderClient>{children}</ThemeProviderClient>
          </ProjectSuggestionProvider>
        </UserProvider>
        <RubikoAssistant />
      </body>
    </html>
  );
}
