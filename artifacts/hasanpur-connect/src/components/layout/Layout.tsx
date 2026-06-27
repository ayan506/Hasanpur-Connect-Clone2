import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import AnnouncementBar from "./AnnouncementBar";
import MarqueeBar from "./MarqueeBar";
import PopupModal from "./PopupModal";
import TopLoadingBar from "./TopLoadingBar";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <TopLoadingBar />
      <AnnouncementBar />
      <Header />
      <MarqueeBar />
      <main className="flex-1 w-full relative">
        {children}
      </main>
      {showFooter && <Footer />}
      <MobileNav />
      <PopupModal />
    </div>
  );
}
