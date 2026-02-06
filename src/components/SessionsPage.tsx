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
} from "lucide-react";

interface Session {
    _id: string;
    date: string;
    className: string;
    section: string;
    subject?: string;
    analysis: {
        totalStudents: number;
        presentCount: number;
        flaggedCount: number;
        proxyProbability: number;
        insights: string[];
    };
    status: "clean" | "suspicious" | "flagged";
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch("/api/sessions?limit=50");
            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this session?")) return;

        try {
            const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
            if (response.ok) {
                setSessions(sessions.filter((s) => s._id !== id));
                if (selectedSession?._id === id) setSelectedSession(null);
            }
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const filteredSessions = sessions.filter((session) => {
        const matchesSearch =
            session.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Session History</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    View and manage analyzed sessions
                </p>
            </div>

            {/* Filters */}
            <div className="card p-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by class or subject..."
                            className="input pl-9 py-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="input w-auto py-2"
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="clean">Clean</option>
                            <option value="suspicious">Suspicious</option>
                            <option value="flagged">Flagged</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sessions List */}
            {loading ? (
                <div className="card p-12 text-center text-gray-400">Loading...</div>
            ) : filteredSessions.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                        {sessions.length === 0 ? "No sessions found" : "No matching sessions"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredSessions.map((session) => {
                        const StatusIcon = statusConfig[session.status].icon;
                        return (
                            <div
                                key={session._id}
                                className="card card-hover p-4 cursor-pointer"
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {session.className}-{session.section}
                                                </span>
                                                <span className={`badge ${statusConfig[session.status].class}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusConfig[session.status].label}
                                                </span>
                                            </div>
                                            {session.subject && (
                                                <p className="text-sm text-gray-500">{session.subject}</p>
                                            )}
                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(session.date)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-medium text-gray-900">
                                                {session.analysis.presentCount}/{session.analysis.totalStudents}
                                            </div>
                                            <div className="text-xs text-gray-400">present</div>
                                        </div>
                                        {session.analysis.flaggedCount > 0 && (
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm font-medium text-red-600">
                                                    {session.analysis.flaggedCount}
                                                </div>
                                                <div className="text-xs text-gray-400">flagged</div>
                                            </div>
                                        )}
                                        <button
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(session._id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto animate-fade-in">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-gray-900">
                                    {selectedSession.className}-{selectedSession.section}
                                </h2>
                                {selectedSession.subject && (
                                    <p className="text-sm text-gray-500">{selectedSession.subject}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-gray-900">
                                        {selectedSession.analysis.totalStudents}
                                    </div>
                                    <div className="text-xs text-gray-500">Total</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-green-700">
                                        {selectedSession.analysis.presentCount}
                                    </div>
                                    <div className="text-xs text-green-600">Present</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-red-700">
                                        {selectedSession.analysis.flaggedCount}
                                    </div>
                                    <div className="text-xs text-red-600">Flagged</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-medium text-gray-900 text-sm mb-2">AI Insights</h3>
                                <div className="space-y-2">
                                    {selectedSession.analysis.insights.map((insight, i) => (
                                        <p key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            {insight}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <span>Risk: {Math.round(selectedSession.analysis.proxyProbability * 100)}%</span>
                                <span>{formatDate(selectedSession.date)}</span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="btn btn-secondary w-full"
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
