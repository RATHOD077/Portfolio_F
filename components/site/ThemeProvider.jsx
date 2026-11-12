"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

// Light/dark theme for the public site. The admin panel is always dark.
export default function ThemeProvider({ children }) {
  const pathname = usePathname();
  const forcedTheme = pathname?.startsWith("/admin") ? "dark" : undefined;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme={forcedTheme}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
