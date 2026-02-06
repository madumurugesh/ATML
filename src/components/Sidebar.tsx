"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Upload,
    History,
    ChevronLeft,
    ChevronRight,
    Shield,
    X,
    Menu,
} from "lucide-react";

type Page = "dashboard" | "upload" | "sessions";

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { id: "upload" as Page, label: "Upload", icon: Upload },
    { id: "sessions" as Page, label: "History", icon: History },
];

export default function Sidebar({
    currentPage,
    onNavigate,
    collapsed,
    onToggleCollapse,
    mobileOpen = false,
    onMobileClose,
}: SidebarProps) {
    // Close mobile sidebar when navigating
    const handleNavigate = (page: Page) => {
        onNavigate(page);
        if (onMobileClose) onMobileClose();
    };

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
          flex flex-col z-50 transition-all duration-200
          ${collapsed ? "md:w-16" : "md:w-56"}
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* Logo */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        {(!collapsed || mobileOpen) && (
                            <span className="font-semibold text-gray-900 animate-fade-in">
                                AttendGuard
                            </span>
                        )}
                    </div>
                    {/* Mobile close button */}
                    {mobileOpen && (
                        <button
                            onClick={onMobileClose}
                            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1 ${isActive
                                        ? "bg-red-50 text-red-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                title={collapsed && !mobileOpen ? item.label : undefined}
                            >
                                <Icon
                                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-red-600" : ""}`}
                                />
                                {(!collapsed || mobileOpen) && (
                                    <span className="animate-fade-in">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Collapse Toggle - hidden on mobile */}
                <div className="p-2 border-t border-gray-100 hidden md:block">
                    <button
                        onClick={onToggleCollapse}
                        className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-xs">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="md:hidden fixed top-3 left-3 z-30 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
            <Menu className="w-5 h-5 text-gray-600" />
        </button>
    );
}
