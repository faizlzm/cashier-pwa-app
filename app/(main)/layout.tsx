import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <Sidebar />

      {/* 
        Main content wrapper 
        - Left padding matched to collapsed sidebar (w-16 = 4rem) 
        - We might need a small adjustment context or just leave it adapting to the sidebar's visual space.
        - Since Sidebar is fixed, we add pl-16 (64px) by default.
      */}
      <div className="pl-16 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary/10 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
