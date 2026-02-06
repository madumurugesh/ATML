"use client";

import { useState, useEffect } from "react";
import {
    Upload,
    Users,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Clock,
    ArrowRight,
} from "lucide-react";

type Page = "dashboard" | "upload" | "sessions";

interface DashboardProps {
    onNavigate: (page: Page) => void;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "red" | "green" | "amber" | "blue";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    const colorClasses = {
        red: "bg-red-50 text-red-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
        blue: "bg-blue-50 text-blue-600",
    };

    return (
        <div className="card p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
                <div>
                    <div className="text-xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{title}</div>
                </div>
            </div>
        </div>
    );
}

interface RecentSessionProps {
    date: string;
    className: string;
    students: number;
    flagged: number;
    status: "clean" | "suspicious" | "flagged";
}

function RecentSession({
    date,
    className,
    students,
    flagged,
    status,
}: RecentSessionProps) {
    const statusConfig = {
        clean: { label: "Clean", class: "badge-success" },
        suspicious: { label: "Review", class: "badge-warning" },
        flagged: { label: "Flagged", class: "badge-danger" },
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                    <div className="font-medium text-gray-900 text-sm">{className}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <div className="text-sm text-gray-900">{students}</div>
                    <div className="text-xs text-gray-400">students</div>
                </div>
                {flagged > 0 && (
                    <div className="text-right">
                        <div className="text-sm text-red-600">{flagged}</div>
                        <div className="text-xs text-gray-400">flagged</div>
                    </div>
                )}
                <span className={`badge ${statusConfig[status].class}`}>
                    {statusConfig[status].label}
                </span>
            </div>
        </div>
    );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
    const [sessions, setSessions] = useState<RecentSessionProps[]>([]);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalStudents: 0,
        flaggedCount: 0,
        cleanRate: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("/api/sessions?limit=5");
            if (response.ok) {
                const data = await response.json();

                // Transform API data to dashboard format
                const recentSessions = data.sessions?.map((session: {
                    date: string;
                    className: string;
                    section: string;
                    analysis?: { totalStudents?: number; flaggedCount?: number };
                    status: "clean" | "suspicious" | "flagged";
                }) => ({
                    date: new Date(session.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    className: `${session.className}-${session.section}`,
                    students: session.analysis?.totalStudents || 0,
                    flagged: session.analysis?.flaggedCount || 0,
                    status: session.status,
                })) || [];

                setSessions(recentSessions);

                // Calculate stats
                const totalSessions = data.pagination?.total || 0;
                let totalStudents = 0;
                let flaggedCount = 0;
                let cleanCount = 0;

                data.sessions?.forEach((s: {
                    analysis?: { totalStudents?: number; flaggedCount?: number };
                    status: string;
                }) => {
                    totalStudents += s.analysis?.totalStudents || 0;
                    flaggedCount += s.analysis?.flaggedCount || 0;
                    if (s.status === "clean") cleanCount++;
                });

                setStats({
                    totalSessions,
                    totalStudents,
                    flaggedCount,
                    cleanRate: totalSessions > 0 ? Math.round((cleanCount / totalSessions) * 100) : 100,
                });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5 hidden sm:block">
                        Monitor attendance and detect anomalies
                    </p>
                </div>
                <button
                    onClick={() => onNavigate("upload")}
                    className="btn btn-primary text-sm"
                >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload Sheet</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                <StatCard
                    title="Sessions"
                    value={stats.totalSessions}
                    icon={<TrendingUp className="w-4 h-4" />}
                    color="blue"
                />
                <StatCard
                    title="Students"
                    value={stats.totalStudents.toLocaleString()}
                    icon={<Users className="w-4 h-4" />}
                    color="green"
                />
                <StatCard
                    title="Flagged"
                    value={stats.flaggedCount}
                    icon={<AlertTriangle className="w-4 h-4" />}
                    color="red"
                />
                <StatCard
                    title="Clean Rate"
                    value={`${stats.cleanRate}%`}
                    icon={<CheckCircle className="w-4 h-4" />}
                    color="green"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Recent Sessions */}
                <div className="lg:col-span-2 card p-3 md:p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">Recent Sessions</h2>
                        <button
                            onClick={() => onNavigate("sessions")}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-8 text-center text-gray-400 text-sm">
                            Loading...
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="py-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">No sessions yet</p>
                            <button
                                onClick={() => onNavigate("upload")}
                                className="text-red-600 text-sm font-medium mt-2"
                            >
                                Upload your first sheet
                            </button>
                        </div>
                    ) : (
                        <div>
                            {sessions.map((session, index) => (
                                <RecentSession key={index} {...session} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Upload - hidden on mobile since we have bottom nav */}
                <div className="card p-4 hidden lg:block">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Upload</h2>
                    <div
                        onClick={() => onNavigate("upload")}
                        className="dropzone flex flex-col items-center justify-center py-8 cursor-pointer"
                    >
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="font-medium text-gray-700 text-sm">Upload Sheet</p>
                        <p className="text-xs text-gray-400 mt-1">CSV or Excel</p>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 space-y-1.5">
                        <p className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            Include student names & bench IDs
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            Supports CSV & XLSX formats
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            AI analysis runs automatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
