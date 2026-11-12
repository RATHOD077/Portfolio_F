"use client";
import dynamic from "next/dynamic";

// Dynamically import with ssr:false inside a dedicated client wrapper
// This is the correct pattern for using dynamic() in Next.js App Router
const PortfolioChatbot = dynamic(
  () => import("@/components/ui/PortfolioChatbot"),
  { ssr: false }
);

// showLauncher=false hides the chatbot's own button; the public site opens it
// from the "Let's talk" contact dock instead.
export default function ChatbotWrapper({ showLauncher = true }: { showLauncher?: boolean }) {
  return <PortfolioChatbot showLauncher={showLauncher} />;
}
