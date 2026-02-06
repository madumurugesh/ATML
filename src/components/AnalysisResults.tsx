"use client";

import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Users,
    UserCheck,
    UserX,
    Sparkles,
    ArrowRight,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Wifi,
    MapPin,
    Download,
    Share2,
    Save,
    Copy,
    Calendar,
    Clock,
    BookOpen,
    Grid3X3,
    Eye,
} from "lucide-react";
import { useState } from "react";

interface FlaggedEntry {
    studentName: string;
    rollNumber: string;
    benchId: string;
    ipAddress?: string;
    reason: string;
    confidence: number;
}

interface SessionMetadata {
    className: string;
    section: string;
    subject: string;
    date: string;
    time: string;
    room: string;
}

interface AnalysisResultProps {
    result: {
        totalStudents: number;
        presentCount: number;
        absentCount?: number;
        flaggedCount: number;
        proxyProbability: number;
        insights: string[];
        flaggedEntries: FlaggedEntry[];
        ipAnalysis?: {
            uniqueIPs: number;
            duplicateIPs: number;
            suspiciousIPs: string[];
        };
        seatingAnalysis?: {
            clusters: number;
            anomalies: number;
        };
    };
    metadata?: SessionMetadata;
    onReset: () => void;
}

// Seating Grid Visualization
function SeatingGrid({ flaggedBenches }: { flaggedBenches: string[] }) {
    const rows = 5;
    const cols = 4;

    return (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: rows * cols }).map((_, i) => {
                const row = Math.floor(i / cols) + 1;
                const col = (i % cols) + 1;
                const benchId = `R${row}C${col}`;
                const isFlagged = flaggedBenches.some(b => b.includes(benchId));

                return (
                    <div
                        key={i}
                        className={`aspect-square rounded text-[8px] sm:text-[10px] flex items-center justify-center font-medium ${isFlagged
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : "bg-gray-100 text-gray-500"
                            }`}
                    >
                        {benchId}
                    </div>
                );
            })}
        </div>
    );
}

// IP Analysis Card
function IPAnalysisCard({ analysis }: { analysis: { uniqueIPs: number; duplicateIPs: number; suspiciousIPs: string[] } }) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">IP Analysis</span>
                </div>
                {analysis.suspiciousIPs.length > 0 && (
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-[10px] sm:text-xs text-amber-600 font-medium"
                    >
                        {showDetails ? "Hide" : "Details"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="text-center p-2 bg-white rounded border border-gray-100">
                    <div className="text-base sm:text-lg font-bold text-gray-900">{analysis.uniqueIPs}</div>
                    <div className="text-[8px] sm:text-[10px] text-gray-500">Unique IPs</div>
                </div>
                <div className="text-center p-2 bg-white rounded border border-gray-100">
                    <div className={`text-base sm:text-lg font-bold ${analysis.duplicateIPs > 0 ? "text-amber-600" : "text-green-600"}`}>
                        {analysis.duplicateIPs}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-gray-500">Duplicates</div>
                </div>
            </div>

            {showDetails && analysis.suspiciousIPs.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 rounded text-[10px] sm:text-xs">
                    <p className="font-medium text-amber-700 mb-1">Suspicious IPs:</p>
                    <div className="flex flex-wrap gap-1">
                        {analysis.suspiciousIPs.map((ip, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                                {ip}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AnalysisResults({ result, metadata, onReset }: AnalysisResultProps) {
    const [insightsExpanded, setInsightsExpanded] = useState(true);
    const [flaggedExpanded, setFlaggedExpanded] = useState(true);
    const [showSeating, setShowSeating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const getStatus = () => {
        if (result.proxyProbability < 0.2) return { label: "Low Risk", color: "green", icon: CheckCircle };
        if (result.proxyProbability < 0.5) return { label: "Medium Risk", color: "amber", icon: AlertTriangle };
        return { label: "High Risk", color: "red", icon: XCircle };
    };

    const status = getStatus();
    const StatusIcon = status.icon;

    const statusColors = {
        green: "bg-green-50 text-green-700 border-green-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        red: "bg-red-50 text-red-700 border-red-200",
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
    };

    const handleCopyReport = () => {
        const report = `
Attendance Analysis Report
${metadata ? `Class: ${metadata.className}-${metadata.section}` : ""}
${metadata?.subject ? `Subject: ${metadata.subject}` : ""}
Date: ${metadata?.date || new Date().toLocaleDateString()}

Summary:
- Total Students: ${result.totalStudents}
- Present: ${result.presentCount}
- Flagged: ${result.flaggedCount}
- Risk Level: ${status.label}

Insights:
${result.insights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}
    `.trim();

        navigator.clipboard.writeText(report);
    };

    const absentCount = result.absentCount || (result.totalStudents - result.presentCount);
    const attendanceRate = Math.round((result.presentCount / result.totalStudents) * 100);

    return (
        <div className="space-y-3">
            {/* Session Header */}
            {metadata && (
                <div className="card p-2.5 sm:p-3 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                            {metadata.className}-{metadata.section}
                        </span>
                        {metadata.subject && (
                            <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {metadata.subject}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(metadata.date).toLocaleDateString()}
                        </span>
                        {metadata.time && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {metadata.time}
                            </span>
                        )}
                        {metadata.room && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {metadata.room}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Status Card */}
            <div className="card p-3 sm:p-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`p-2 sm:p-2.5 rounded-lg border ${statusColors[status.color as keyof typeof statusColors]}`}>
                            <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-lg font-bold text-gray-900">
                                Analysis Complete
                            </h2>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                {result.totalStudents} students • {attendanceRate}% attendance
                            </p>
                        </div>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border ${statusColors[status.color as keyof typeof statusColors]}`}>
                        {status.label}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-center">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto" />
                        <div className="text-sm sm:text-lg font-bold text-gray-900 mt-1">{result.totalStudents}</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-500">Total</div>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-50 rounded-lg text-center">
                        <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" />
                        <div className="text-sm sm:text-lg font-bold text-green-700 mt-1">{result.presentCount}</div>
                        <div className="text-[8px] sm:text-[10px] text-green-600">Present</div>
                    </div>
                    <div className="p-2 sm:p-3 bg-gray-100 rounded-lg text-center">
                        <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto" />
                        <div className="text-sm sm:text-lg font-bold text-gray-600 mt-1">{absentCount}</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-500">Absent</div>
                    </div>
                    <div className="p-2 sm:p-3 bg-red-50 rounded-lg text-center">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" />
                        <div className="text-sm sm:text-lg font-bold text-red-700 mt-1">{result.flaggedCount}</div>
                        <div className="text-[8px] sm:text-[10px] text-red-600">Flagged</div>
                    </div>
                </div>

                {/* Risk Meter */}
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">Proxy Risk Level</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {Math.round(result.proxyProbability * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${result.proxyProbability < 0.2 ? "bg-green-500" :
                                    result.proxyProbability < 0.5 ? "bg-amber-500" : "bg-red-500"
                                }`}
                            style={{ width: `${result.proxyProbability * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] sm:text-[10px] text-gray-400">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                    </div>
                </div>
            </div>

            {/* Analysis Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* IP Analysis */}
                {result.ipAnalysis && (
                    <IPAnalysisCard analysis={result.ipAnalysis} />
                )}

                {/* Seating Analysis */}
                {result.seatingAnalysis && (
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Grid3X3 className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs sm:text-sm font-medium text-gray-900">Seating Analysis</span>
                            </div>
                            <button
                                onClick={() => setShowSeating(!showSeating)}
                                className="text-[10px] sm:text-xs text-blue-600 font-medium flex items-center gap-1"
                            >
                                <Eye className="w-3 h-3" />
                                {showSeating ? "Hide" : "View"}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="text-center p-2 bg-white rounded border border-gray-100">
                                <div className="text-base sm:text-lg font-bold text-gray-900">{result.seatingAnalysis.clusters}</div>
                                <div className="text-[8px] sm:text-[10px] text-gray-500">Clusters</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border border-gray-100">
                                <div className={`text-base sm:text-lg font-bold ${result.seatingAnalysis.anomalies > 0 ? "text-blue-600" : "text-green-600"}`}>
                                    {result.seatingAnalysis.anomalies}
                                </div>
                                <div className="text-[8px] sm:text-[10px] text-gray-500">Anomalies</div>
                            </div>
                        </div>

                        {showSeating && (
                            <div className="mt-3 p-2 bg-white rounded border border-gray-100">
                                <SeatingGrid flaggedBenches={result.flaggedEntries.map(e => e.benchId)} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Insights */}
            <div className="card overflow-hidden">
                <button
                    onClick={() => setInsightsExpanded(!insightsExpanded)}
                    className="w-full p-2.5 sm:p-3 flex items-center justify-between bg-gray-50 border-b border-gray-100"
                >
                    <span className="font-medium text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        AI Insights ({result.insights.length})
                    </span>
                    {insightsExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>

                {insightsExpanded && (
                    <div className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                        {result.insights.map((insight, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-1.5 sm:gap-2 p-2 bg-gray-50 rounded text-[10px] sm:text-xs text-gray-700"
                            >
                                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{insight}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Flagged Entries */}
            {result.flaggedEntries.length > 0 && (
                <div className="card overflow-hidden">
                    <button
                        onClick={() => setFlaggedExpanded(!flaggedExpanded)}
                        className="w-full p-2.5 sm:p-3 flex items-center justify-between bg-red-50 border-b border-red-100"
                    >
                        <span className="font-medium text-red-800 text-xs sm:text-sm flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Flagged Students ({result.flaggedEntries.length})
                        </span>
                        {flaggedExpanded ? (
                            <ChevronUp className="w-4 h-4 text-red-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-red-400" />
                        )}
                    </button>

                    {flaggedExpanded && (
                        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                            {result.flaggedEntries.map((entry, index) => (
                                <div key={index} className="p-2.5 sm:p-3">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-900 text-xs sm:text-sm block truncate">
                                                {entry.studentName}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] sm:text-xs text-gray-500">{entry.rollNumber}</span>
                                                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                                    {entry.benchId}
                                                </span>
                                                {entry.ipAddress && (
                                                    <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded flex items-center gap-0.5">
                                                        <Wifi className="w-2.5 h-2.5" />
                                                        {entry.ipAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <div className="w-10 sm:w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500"
                                                    style={{ width: `${entry.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[8px] sm:text-[10px] text-gray-500 w-7 text-right">
                                                {Math.round(entry.confidence * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                                        {entry.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="card p-2.5 sm:p-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className="btn btn-primary text-xs sm:text-sm py-2.5 flex-1"
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                Save Session
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleCopyReport}
                        className="btn btn-secondary text-xs sm:text-sm py-2.5 flex-1"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Report
                    </button>
                </div>
                <div className="flex gap-2 mt-2">
                    <button className="btn btn-ghost text-xs sm:text-sm py-2 flex-1">
                        <Download className="w-3.5 h-3.5" />
                        Export PDF
                    </button>
                    <button className="btn btn-ghost text-xs sm:text-sm py-2 flex-1">
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>
                </div>
                <button
                    onClick={onReset}
                    className="w-full mt-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                    Analyze Another Session
                </button>
            </div>
        </div>
    );
}
