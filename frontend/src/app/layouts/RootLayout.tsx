import { Outlet } from "react-router";
import { TopNavigation } from "../components/TopNavigation";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <TopNavigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
