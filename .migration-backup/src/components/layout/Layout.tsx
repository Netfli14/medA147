import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooterDisclaimer?: boolean;
}

export function Layout({ children, showFooterDisclaimer = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer showDisclaimer={showFooterDisclaimer} />
    </div>
  );
}
