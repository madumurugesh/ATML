import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AttendGuard - Proxy Attendance Detection",
    description: "AI-powered proxy attendance detection system using Gemini API",
    keywords: ["attendance", "proxy detection", "machine learning", "education"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    );
}
