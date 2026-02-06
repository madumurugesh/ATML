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
} from "lucide-react";

interface FlaggedEntry {
    studentName: string;
    rollNumber: string;
    benchId: string;
    reason: string;
    confidence: number;
}

interface AnalysisResultProps {
    result: {
        totalStudents: number;
        presentCount: number;
        flaggedCount: number;
        proxyProbability: number;
        insights: string[];
        flaggedEntries: FlaggedEntry[];
    };
    onReset: () => void;
}

export default function AnalysisResults({ result, onReset }: AnalysisResultProps) {
    const getStatus = () => {
        if (result.proxyProbability < 0.2) return { label: "Clean", color: "green", icon: CheckCircle };
        if (result.proxyProbability < 0.5) return { label: "Review", color: "amber", icon: AlertTriangle };
        return { label: "High Risk", color: "red", icon: XCircle };
    };

    const status = getStatus();
    const StatusIcon = status.icon;

    const statusColors = {
        green: "bg-green-50 text-green-700 border-green-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        red: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Status Card */}
            <div className="card p-4 md:p-5">
                {/* Header - stacks on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 md:p-3 rounded-lg border ${statusColors[status.color as keyof typeof statusColors]}`}>
                            <StatusIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-900">Analysis Complete</h2>
                            <p className="text-xs md:text-sm text-gray-500">
                                {result.totalStudents} students analyzed
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium border self-start sm:self-auto ${statusColors[status.color as keyof typeof statusColors]}`}>
                        {status.label}
                    </div>
                </div>

                {/* Stats - 2x2 grid on mobile, 4 cols on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    <div className="p-2 md:p-3 bg-gray-50 rounded-lg text-center">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mx-auto mb-1" />
                        <div className="text-base md:text-lg font-bold text-gray-900">{result.totalStudents}</div>
                        <div className="text-[10px] md:text-xs text-gray-500">Total</div>
                    </div>
                    <div className="p-2 md:p-3 bg-green-50 rounded-lg text-center">
                        <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto mb-1" />
                        <div className="text-base md:text-lg font-bold text-green-700">{result.presentCount}</div>
                        <div className="text-[10px] md:text-xs text-green-600">Present</div>
                    </div>
                    <div className="p-2 md:p-3 bg-red-50 rounded-lg text-center">
                        <UserX className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto mb-1" />
                        <div className="text-base md:text-lg font-bold text-red-700">{result.flaggedCount}</div>
                        <div className="text-[10px] md:text-xs text-red-600">Flagged</div>
                    </div>
                    <div className="p-2 md:p-3 bg-blue-50 rounded-lg text-center">
                        <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mx-auto mb-1" />
                        <div className="text-base md:text-lg font-bold text-blue-700">
                            {Math.round(result.proxyProbability * 100)}%
                        </div>
                        <div className="text-[10px] md:text-xs text-blue-600">Risk</div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="card p-3 md:p-4">
                <h3 className="font-medium text-gray-900 text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    AI Insights
                </h3>
                <div className="space-y-2">
                    {result.insights.map((insight, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-xs md:text-sm text-gray-700"
                        >
                            <ArrowRight className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{insight}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flagged Entries - Card layout on mobile, table on desktop */}
            {result.flaggedEntries.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="p-3 bg-red-50 border-b border-red-100">
                        <h3 className="font-medium text-red-800 text-xs md:text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Flagged ({result.flaggedEntries.length})
                        </h3>
                    </div>

                    {/* Mobile: Card layout */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {result.flaggedEntries.map((entry, index) => (
                            <div key={index} className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 text-sm">{entry.studentName}</span>
                                    <span className="badge badge-info text-[10px]">{entry.benchId}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{entry.rollNumber}</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{ width: `${entry.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            {Math.round(entry.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">{entry.reason}</p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table layout */}
                    <div className="hidden md:block table-container border-0 rounded-none">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Roll No</th>
                                    <th>Bench</th>
                                    <th>Reason</th>
                                    <th>Conf</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.flaggedEntries.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="font-medium text-gray-900 text-sm">{entry.studentName}</td>
                                        <td className="text-gray-600 text-sm">{entry.rollNumber}</td>
                                        <td>
                                            <span className="badge badge-info">{entry.benchId}</span>
                                        </td>
                                        <td className="text-xs text-gray-500 max-w-[200px] truncate">
                                            {entry.reason}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-500"
                                                        style={{ width: `${entry.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {Math.round(entry.confidence * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Actions - stack on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2">
                <button onClick={onReset} className="btn btn-secondary text-sm order-2 sm:order-1">
                    Analyze Another
                </button>
                <button className="btn btn-primary text-sm order-1 sm:order-2">
                    Save Session
                </button>
            </div>
        </div>
    );
}
