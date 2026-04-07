import { SiteNav } from "@/components/ui/SiteNav";
import { Footer } from "@/components/ui/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}

