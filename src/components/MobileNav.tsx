"use client";

import { LayoutDashboard, Upload, History } from "lucide-react";

type Page = "dashboard" | "upload" | "sessions";

interface MobileNavProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const navItems = [
    { id: "dashboard" as Page, label: "Home", icon: LayoutDashboard },
    { id: "upload" as Page, label: "Upload", icon: Upload },
    { id: "sessions" as Page, label: "History", icon: History },
];

export default function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
            <div className="flex items-center justify-around py-2 px-4 safe-area-pb">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${isActive
                                    ? "text-red-600"
                                    : "text-gray-400"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-red-600" : ""}`} />
                            <span className={`text-xs font-medium ${isActive ? "text-red-600" : ""}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
