"use client";

import { useState, useEffect } from "react";
import {
    Upload,
    Users,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    ArrowRight,
    Activity,
    Shield,
    Calendar,
    Wifi,
    MapPin,
    BarChart2,
    PieChart,
    Zap,
} from "lucide-react";

type Page = "dashboard" | "upload" | "sessions";

interface DashboardProps {
    onNavigate: (page: Page) => void;
}

// Mini sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
        <div className="flex items-end gap-0.5 h-6">
            {data.map((value, i) => (
                <div
                    key={i}
                    className={`w-1 rounded-full ${color}`}
                    style={{ height: `${((value - min) / range) * 100}%`, minHeight: '4px' }}
                />
            ))}
        </div>
    );
}

// Stat card with trend
function StatCard({
    title,
    value,
    icon,
    color,
    trend,
    sparklineData
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "red" | "green" | "amber" | "blue";
    trend?: { value: number; isUp: boolean };
    sparklineData?: number[];
}) {
    const colorClasses = {
        red: "bg-red-50 text-red-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
        blue: "bg-blue-50 text-blue-600",
    };

    const sparklineColors = {
        red: "bg-red-400",
        green: "bg-green-400",
        amber: "bg-amber-400",
        blue: "bg-blue-400",
    };

    return (
        <div className="card p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
                {sparklineData && (
                    <Sparkline data={sparklineData} color={sparklineColors[color]} />
                )}
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">{value}</div>
            <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-500">{title}</span>
                {trend && (
                    <span className={`text-[10px] sm:text-xs font-medium flex items-center gap-0.5 ${trend.isUp ? "text-green-600" : "text-red-600"
                        }`}>
                        {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
}

// Activity feed item
function ActivityItem({
    type,
    message,
    time,
    status
}: {
    type: "upload" | "analysis" | "alert" | "system";
    message: string;
    time: string;
    status?: "success" | "warning" | "error";
}) {
    const icons = {
        upload: Upload,
        analysis: Activity,
        alert: AlertTriangle,
        system: Shield,
    };
    const Icon = icons[type];

    const statusColors = {
        success: "text-green-600 bg-green-50",
        warning: "text-amber-600 bg-amber-50",
        error: "text-red-600 bg-red-50",
    };

    return (
        <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
            <div className={`p-1.5 rounded-lg ${status ? statusColors[status] : "text-gray-400 bg-gray-100"}`}>
                <Icon className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-700 truncate">{message}</p>
                <p className="text-[10px] text-gray-400">{time}</p>
            </div>
        </div>
    );
}

// Quick insight card
function InsightCard({
    icon,
    title,
    value,
    description,
    color
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
    color: string;
}) {
    return (
        <div className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1 rounded ${color}`}>
                    {icon}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {title}
                </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{value}</div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
    );
}

// Risk distribution bar
function RiskDistribution({ clean, suspicious, flagged }: { clean: number; suspicious: number; flagged: number }) {
    const total = clean + suspicious + flagged || 1;

    return (
        <div className="space-y-2">
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${(clean / total) * 100}%` }}
                />
                <div
                    className="bg-amber-500 transition-all duration-500"
                    style={{ width: `${(suspicious / total) * 100}%` }}
                />
                <div
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${(flagged / total) * 100}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Clean {Math.round((clean / total) * 100)}%
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Review {Math.round((suspicious / total) * 100)}%
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Flagged {Math.round((flagged / total) * 100)}%
                </span>
            </div>
        </div>
    );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 12,
        totalStudents: 584,
        flaggedCount: 23,
        cleanRate: 92,
        avgAttendance: 87,
        ipAnomalies: 5,
        recentTrend: [65, 72, 80, 75, 88, 92, 85],
        riskDistribution: { clean: 45, suspicious: 12, flagged: 8 }
    });

    const [activities] = useState([
        { type: "analysis" as const, message: "CSE-A session analyzed - 2 flagged", time: "2 min ago", status: "warning" as const },
        { type: "upload" as const, message: "ECE-B attendance sheet uploaded", time: "15 min ago", status: "success" as const },
        { type: "alert" as const, message: "High proxy risk in MECH-C", time: "1 hour ago", status: "error" as const },
        { type: "system" as const, message: "Weekly report generated", time: "3 hours ago", status: "success" as const },
    ]);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                        Real-time attendance monitoring & analytics
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary text-xs sm:text-sm py-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">This Week</span>
                    </button>
                    <button
                        onClick={() => onNavigate("upload")}
                        className="btn btn-primary text-xs sm:text-sm py-2"
                    >
                        <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Upload</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <StatCard
                    title="Sessions"
                    value={stats.totalSessions}
                    icon={<BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    color="blue"
                    trend={{ value: 15, isUp: true }}
                    sparklineData={[8, 10, 9, 12, 11, 12, 12]}
                />
                <StatCard
                    title="Students"
                    value={stats.totalStudents.toLocaleString()}
                    icon={<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    color="green"
                    trend={{ value: 8, isUp: true }}
                    sparklineData={[420, 450, 480, 520, 550, 570, 584]}
                />
                <StatCard
                    title="Flagged"
                    value={stats.flaggedCount}
                    icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    color="red"
                    trend={{ value: 12, isUp: false }}
                    sparklineData={[35, 30, 28, 25, 24, 23, 23]}
                />
                <StatCard
                    title="Clean Rate"
                    value={`${stats.cleanRate}%`}
                    icon={<CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    color="green"
                    trend={{ value: 3, isUp: true }}
                    sparklineData={[85, 87, 88, 90, 91, 91, 92]}
                />
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <InsightCard
                    icon={<TrendingUp className="w-3 h-3 text-green-600" />}
                    title="Attendance"
                    value={`${stats.avgAttendance}%`}
                    description="Avg this week"
                    color="bg-green-100"
                />
                <InsightCard
                    icon={<Wifi className="w-3 h-3 text-amber-600" />}
                    title="IP Anomalies"
                    value={stats.ipAnomalies.toString()}
                    description="Duplicate IPs detected"
                    color="bg-amber-100"
                />
                <InsightCard
                    icon={<MapPin className="w-3 h-3 text-blue-600" />}
                    title="Locations"
                    value="3"
                    description="Active classrooms"
                    color="bg-blue-100"
                />
                <InsightCard
                    icon={<Zap className="w-3 h-3 text-purple-600" />}
                    title="AI Accuracy"
                    value="96.5%"
                    description="Detection rate"
                    color="bg-purple-100"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Risk Distribution */}
                <div className="lg:col-span-2 card p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-red-600" />
                            Risk Distribution
                        </h2>
                        <span className="text-[10px] sm:text-xs text-gray-400">Last 7 days</span>
                    </div>

                    <RiskDistribution
                        clean={stats.riskDistribution.clean}
                        suspicious={stats.riskDistribution.suspicious}
                        flagged={stats.riskDistribution.flagged}
                    />

                    {/* Weekly Trend */}
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Weekly Trend</h3>
                        <div className="flex items-end justify-between h-16 sm:h-20 gap-1">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-red-500 rounded-t transition-all duration-500 hover:bg-red-600"
                                        style={{ height: `${stats.recentTrend[i]}%` }}
                                    />
                                    <span className="text-[8px] sm:text-[10px] text-gray-400">{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="card p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Recent Activity
                        </h2>
                        <button className="text-[10px] sm:text-xs text-red-600 font-medium">View all</button>
                    </div>

                    <div className="space-y-0">
                        {activities.map((activity, i) => (
                            <ActivityItem key={i} {...activity} />
                        ))}
                    </div>

                    {/* Quick Upload */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => onNavigate("upload")}
                            className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-red-600"
                        >
                            <Upload className="w-4 h-4" />
                            <span className="text-xs sm:text-sm font-medium">Quick Upload</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                    onClick={() => onNavigate("sessions")}
                    className="flex-1 card card-hover p-3 sm:p-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">View History</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Browse all sessions</p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                    onClick={() => onNavigate("upload")}
                    className="flex-1 card card-hover p-3 sm:p-4 flex items-center justify-between bg-gradient-to-r from-red-50 to-white border-red-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">New Analysis</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Upload & detect proxies</p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-400" />
                </button>
            </div>
        </div>
    );
}
