"use client";

import { useState } from "react";
import Sidebar, { MobileMenuButton } from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Dashboard from "@/components/Dashboard";
import UploadSection from "@/components/UploadSection";
import SessionsPage from "@/components/SessionsPage";

type Page = "dashboard" | "upload" | "sessions";

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const renderPage = () => {
        switch (currentPage) {
            case "dashboard":
                return <Dashboard onNavigate={setCurrentPage} />;
            case "upload":
                return <UploadSection />;
            case "sessions":
                return <SessionsPage />;
            default:
                return <Dashboard onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-neutral-50">
            {/* Mobile Menu Button */}
            <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

            {/* Sidebar - slide out on mobile */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-200 pb-20 md:pb-0 ${sidebarCollapsed ? "md:ml-16" : "md:ml-56"
                    }`}
            >
                <div className="p-4 pt-14 md:pt-6 md:p-6 max-w-6xl mx-auto">
                    {renderPage()}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
        </div>
    );
}
