import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {navOpen && (
        <div className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-sm md:hidden" onClick={() => setNavOpen(false)} />
      )}
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main key={pathname} className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
