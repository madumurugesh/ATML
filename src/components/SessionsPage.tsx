"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    ChevronRight,
    Trash2,
    X,
    Calendar,
    Download,
    BarChart2,
    TrendingUp,
    Eye,
    Wifi,
    MapPin,
    SlidersHorizontal,
} from "lucide-react";

interface Session {
    _id: string;
    date: string;
    className: string;
    section: string;
    subject?: string;
    room?: string;
    analysis: {
        totalStudents: number;
        presentCount: number;
        flaggedCount: number;
        proxyProbability: number;
        insights: string[];
        ipAnalysis?: {
            uniqueIPs: number;
            duplicateIPs: number;
        };
    };
    status: "clean" | "suspicious" | "flagged";
}

// Stats Summary Component
function StatsSummary({ sessions }: { sessions: Session[] }) {
    const totalSessions = sessions.length;
    const totalStudents = sessions.reduce((sum, s) => sum + s.analysis.totalStudents, 0);
    const totalFlagged = sessions.reduce((sum, s) => sum + s.analysis.flaggedCount, 0);
    const cleanSessions = sessions.filter(s => s.status === "clean").length;
    const cleanRate = totalSessions > 0 ? Math.round((cleanSessions / totalSessions) * 100) : 0;

    return (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <div className="card p-2 sm:p-3 text-center">
                <BarChart2 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <div className="text-sm sm:text-lg font-bold text-gray-900">{totalSessions}</div>
                <div className="text-[8px] sm:text-xs text-gray-500">Sessions</div>
            </div>
            <div className="card p-2 sm:p-3 text-center">
                <Users className="w-4 h-4 text-green-500 mx-auto mb-1" />
                <div className="text-sm sm:text-lg font-bold text-gray-900">{totalStudents}</div>
                <div className="text-[8px] sm:text-xs text-gray-500">Students</div>
            </div>
            <div className="card p-2 sm:p-3 text-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mx-auto mb-1" />
                <div className="text-sm sm:text-lg font-bold text-gray-900">{totalFlagged}</div>
                <div className="text-[8px] sm:text-xs text-gray-500">Flagged</div>
            </div>
            <div className="card p-2 sm:p-3 text-center">
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <div className="text-sm sm:text-lg font-bold text-gray-900">{cleanRate}%</div>
                <div className="text-[8px] sm:text-xs text-gray-500">Clean</div>
            </div>
        </div>
    );
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<string>("all");
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            // Simulated data for demo
            const demoSessions: Session[] = [
                {
                    _id: "1",
                    date: new Date().toISOString(),
                    className: "CSE",
                    section: "A",
                    subject: "Data Structures",
                    room: "LH-201",
                    analysis: {
                        totalStudents: 50,
                        presentCount: 47,
                        flaggedCount: 2,
                        proxyProbability: 0.15,
                        insights: ["2 students flagged for IP anomaly", "Seating pattern normal"],
                        ipAnalysis: { uniqueIPs: 45, duplicateIPs: 2 }
                    },
                    status: "clean"
                },
                {
                    _id: "2",
                    date: new Date(Date.now() - 86400000).toISOString(),
                    className: "ECE",
                    section: "B",
                    subject: "Digital Electronics",
                    room: "LH-102",
                    analysis: {
                        totalStudents: 48,
                        presentCount: 42,
                        flaggedCount: 5,
                        proxyProbability: 0.45,
                        insights: ["5 students with duplicate IPs", "Suspicious seating cluster detected"],
                        ipAnalysis: { uniqueIPs: 38, duplicateIPs: 5 }
                    },
                    status: "suspicious"
                },
                {
                    _id: "3",
                    date: new Date(Date.now() - 172800000).toISOString(),
                    className: "MECH",
                    section: "C",
                    subject: "Thermodynamics",
                    room: "LH-301",
                    analysis: {
                        totalStudents: 52,
                        presentCount: 48,
                        flaggedCount: 8,
                        proxyProbability: 0.72,
                        insights: ["High proxy probability detected", "8 entries flagged for review", "Multiple IP clusters found"],
                        ipAnalysis: { uniqueIPs: 35, duplicateIPs: 8 }
                    },
                    status: "flagged"
                },
                {
                    _id: "4",
                    date: new Date(Date.now() - 259200000).toISOString(),
                    className: "CSE",
                    section: "B",
                    subject: "Operating Systems",
                    room: "LH-205",
                    analysis: {
                        totalStudents: 45,
                        presentCount: 44,
                        flaggedCount: 0,
                        proxyProbability: 0.05,
                        insights: ["All attendance verified", "No anomalies detected"],
                        ipAnalysis: { uniqueIPs: 44, duplicateIPs: 0 }
                    },
                    status: "clean"
                },
                {
                    _id: "5",
                    date: new Date(Date.now() - 345600000).toISOString(),
                    className: "IT",
                    section: "A",
                    subject: "Database Systems",
                    room: "LH-108",
                    analysis: {
                        totalStudents: 55,
                        presentCount: 50,
                        flaggedCount: 3,
                        proxyProbability: 0.28,
                        insights: ["3 students flagged", "Minor IP overlap detected"],
                        ipAnalysis: { uniqueIPs: 48, duplicateIPs: 3 }
                    },
                    status: "suspicious"
                }
            ];

            setSessions(demoSessions);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this session?")) return;
        setSessions(sessions.filter((s) => s._id !== id));
        if (selectedSession?._id === id) setSelectedSession(null);
    };

    const getDateFilteredSessions = () => {
        const now = new Date();
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            switch (dateRange) {
                case "today":
                    return sessionDate.toDateString() === now.toDateString();
                case "week":
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return sessionDate >= weekAgo;
                case "month":
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return sessionDate >= monthAgo;
                default:
                    return true;
            }
        });
    };

    const filteredSessions = getDateFilteredSessions().filter((session) => {
        const matchesSearch =
            session.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (session.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesFilter =
            selectedFilter === "all" || session.status === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    const statusConfig = {
        clean: { label: "Clean", class: "badge-success", icon: CheckCircle },
        suspicious: { label: "Review", class: "badge-warning", icon: AlertTriangle },
        flagged: { label: "Flagged", class: "badge-danger", icon: AlertTriangle },
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Session History</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                        View and manage analyzed sessions
                    </p>
                </div>
                <button className="btn btn-secondary text-xs sm:text-sm py-2">
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Export All</span>
                </button>
            </div>

            {/* Stats Summary */}
            <StatsSummary sessions={sessions} />

            {/* Filters */}
            <div className="card p-2.5 sm:p-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search class, section, subject..."
                            className="input pl-9 py-2 text-xs sm:text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden btn btn-secondary py-2 text-xs"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                className="input w-auto py-2 text-xs sm:text-sm"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                className="input w-auto py-2 text-xs sm:text-sm"
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="clean">Clean</option>
                                <option value="suspicious">Suspicious</option>
                                <option value="flagged">Flagged</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Mobile Filters (Expandable) */}
                {showFilters && (
                    <div className="sm:hidden flex gap-2 mt-2 pt-2 border-t border-gray-100">
                        <select
                            className="input flex-1 py-2 text-xs"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <select
                            className="input flex-1 py-2 text-xs"
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="clean">Clean</option>
                            <option value="suspicious">Suspicious</option>
                            <option value="flagged">Flagged</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Sessions List */}
            {loading ? (
                <div className="card p-12 text-center text-gray-400 text-sm">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading sessions...
                </div>
            ) : filteredSessions.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                        {sessions.length === 0 ? "No sessions yet" : "No matching sessions"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredSessions.map((session) => {
                        const StatusIcon = statusConfig[session.status].icon;
                        const attendanceRate = Math.round((session.analysis.presentCount / session.analysis.totalStudents) * 100);

                        return (
                            <div
                                key={session._id}
                                className="card card-hover p-3 sm:p-4 cursor-pointer"
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="flex items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                        {/* Status Icon */}
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${session.status === "clean" ? "bg-green-50" :
                                                session.status === "suspicious" ? "bg-amber-50" : "bg-red-50"
                                            }`}>
                                            <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${session.status === "clean" ? "text-green-600" :
                                                    session.status === "suspicious" ? "text-amber-600" : "text-red-600"
                                                }`} />
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                                    {session.className}-{session.section}
                                                </span>
                                                <span className={`badge ${statusConfig[session.status].class} text-[10px] sm:text-xs`}>
                                                    {statusConfig[session.status].label}
                                                </span>
                                            </div>
                                            {session.subject && (
                                                <p className="text-xs sm:text-sm text-gray-600 truncate">{session.subject}</p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(session.date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(session.date)}
                                                </span>
                                                {session.room && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {session.room}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                        {/* Desktop Stats */}
                                        <div className="hidden sm:flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {session.analysis.presentCount}/{session.analysis.totalStudents}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{attendanceRate}% present</div>
                                            </div>
                                            {session.analysis.flaggedCount > 0 && (
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-red-600">
                                                        {session.analysis.flaggedCount}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">flagged</div>
                                                </div>
                                            )}
                                            {session.analysis.ipAnalysis && session.analysis.ipAnalysis.duplicateIPs > 0 && (
                                                <div className="flex items-center gap-1 text-amber-600">
                                                    <Wifi className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{session.analysis.ipAnalysis.duplicateIPs}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(session._id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                                    </div>
                                </div>

                                {/* Mobile Stats Row */}
                                <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="text-gray-600">
                                            <span className="font-medium">{attendanceRate}%</span> present
                                        </span>
                                        {session.analysis.flaggedCount > 0 && (
                                            <span className="text-red-600">
                                                <span className="font-medium">{session.analysis.flaggedCount}</span> flagged
                                            </span>
                                        )}
                                        {session.analysis.ipAnalysis?.duplicateIPs > 0 && (
                                            <span className="flex items-center gap-0.5 text-amber-600">
                                                <Wifi className="w-3 h-3" />
                                                {session.analysis.ipAnalysis.duplicateIPs} IPs
                                            </span>
                                        )}
                                    </div>
                                    <Eye className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:rounded-lg sm:max-w-lg max-h-[85vh] overflow-auto animate-fade-in rounded-t-2xl">
                        {/* Header */}
                        <div className="sticky top-0 bg-white p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between z-10">
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {selectedSession.className}-{selectedSession.section}
                                </h2>
                                {selectedSession.subject && (
                                    <p className="text-xs sm:text-sm text-gray-500">{selectedSession.subject}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 sm:p-4 space-y-4">
                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(selectedSession.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(selectedSession.date)}
                                </span>
                                {selectedSession.room && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {selectedSession.room}
                                    </span>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-base sm:text-lg font-bold text-gray-900">
                                        {selectedSession.analysis.totalStudents}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">Total</div>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-50 rounded-lg text-center">
                                    <div className="text-base sm:text-lg font-bold text-green-700">
                                        {selectedSession.analysis.presentCount}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-green-600">Present</div>
                                </div>
                                <div className="p-2 sm:p-3 bg-red-50 rounded-lg text-center">
                                    <div className="text-base sm:text-lg font-bold text-red-700">
                                        {selectedSession.analysis.flaggedCount}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-red-600">Flagged</div>
                                </div>
                                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg text-center">
                                    <div className="text-base sm:text-lg font-bold text-blue-700">
                                        {Math.round(selectedSession.analysis.proxyProbability * 100)}%
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-blue-600">Risk</div>
                                </div>
                            </div>

                            {/* IP Analysis */}
                            {selectedSession.analysis.ipAnalysis && (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wifi className="w-4 h-4 text-amber-600" />
                                        <span className="font-medium text-amber-800 text-sm">IP Analysis</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{selectedSession.analysis.ipAnalysis.uniqueIPs}</div>
                                            <div className="text-xs text-gray-500">Unique IPs</div>
                                        </div>
                                        <div>
                                            <div className={`text-lg font-bold ${selectedSession.analysis.ipAnalysis.duplicateIPs > 0 ? "text-amber-600" : "text-green-600"}`}>
                                                {selectedSession.analysis.ipAnalysis.duplicateIPs}
                                            </div>
                                            <div className="text-xs text-gray-500">Duplicate IPs</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Insights */}
                            <div>
                                <h3 className="font-medium text-gray-900 text-sm mb-2">AI Insights</h3>
                                <div className="space-y-1.5">
                                    {selectedSession.analysis.insights.map((insight, i) => (
                                        <p key={i} className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 rounded flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                            {insight}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 bg-white p-3 sm:p-4 border-t border-gray-100 flex gap-2">
                            <button className="btn btn-secondary flex-1 text-xs sm:text-sm py-2.5">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="btn btn-primary flex-1 text-xs sm:text-sm py-2.5"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
