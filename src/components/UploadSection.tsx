"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    FileSpreadsheet,
    X,
    Check,
    AlertCircle,
    Loader2,
    Sparkles,
    Calendar,
    BookOpen,
    Users,
    MapPin,
    Clock,
    Info,
    ChevronDown,
    Zap,
    CheckCircle2,
    Wifi,
} from "lucide-react";
import DataPreview from "./DataPreview";
import AnalysisResults from "./AnalysisResults";

interface DetectedMetadata {
    className: string | null;
    section: string | null;
    subject: string | null;
    room: string | null;
    date: string | null;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    hasIPColumn: boolean;
    hasBenchIdColumn: boolean;
}

interface ParsedData {
    headers: string[];
    rows: Record<string, string>[];
    detectedMetadata?: DetectedMetadata;
}

interface AnalysisResult {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    flaggedCount: number;
    proxyProbability: number;
    insights: string[];
    flaggedEntries: {
        studentName: string;
        rollNumber: string;
        benchId: string;
        ipAddress?: string;
        reason: string;
        confidence: number;
    }[];
    ipAnalysis: {
        uniqueIPs: number;
        duplicateIPs: number;
        suspiciousIPs: string[];
    };
    seatingAnalysis: {
        clusters: number;
        anomalies: number;
    };
}

interface SessionMetadata {
    className: string;
    section: string;
    subject: string;
    date: string;
    time: string;
    room: string;
}

type UploadStep = "upload" | "metadata" | "preview" | "analyzing" | "results";

export default function UploadSection() {
    const [step, setStep] = useState<UploadStep>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [autoDetected, setAutoDetected] = useState<string[]>([]);
    const [metadata, setMetadata] = useState<SessionMetadata>({
        className: "",
        section: "",
        subject: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        room: "",
    });

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setError(null);
        setIsLoading(true);
        setAutoDetected([]);

        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to parse file");
            }

            const data = await response.json();
            setParsedData(data);

            // Auto-fill metadata from detected values
            const detected: string[] = [];
            const newMetadata = { ...metadata };

            if (data.detectedMetadata) {
                const dm = data.detectedMetadata;

                if (dm.className) {
                    newMetadata.className = dm.className;
                    detected.push("Class");
                }
                if (dm.section) {
                    newMetadata.section = dm.section;
                    detected.push("Section");
                }
                if (dm.subject) {
                    newMetadata.subject = dm.subject;
                    detected.push("Subject");
                }
                if (dm.room) {
                    newMetadata.room = dm.room;
                    detected.push("Room");
                }
            }

            setMetadata(newMetadata);
            setAutoDetected(detected);
            setStep("metadata");
        } catch (err) {
            setError("Failed to parse the file. Check the format.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [metadata]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
        },
        multiple: false,
    });

    const handleAnalyze = async () => {
        if (!parsedData) return;

        setStep("analyzing");
        setIsLoading(true);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: parsedData, metadata }),
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const result = await response.json();
            setAnalysisResult(result);
            setStep("results");
        } catch (err) {
            setError("Analysis failed. Please try again.");
            setStep("preview");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStep("upload");
        setFile(null);
        setParsedData(null);
        setAnalysisResult(null);
        setError(null);
        setMetadata({
            className: "",
            section: "",
            subject: "",
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().slice(0, 5),
            room: "",
        });
    };

    const steps = ["Upload", "Details", "Preview", "Analyze", "Results"];
    const stepIndex = ["upload", "metadata", "preview", "analyzing", "results"].indexOf(step);

    const classOptions = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "AIDS", "AIML"];
    const sectionOptions = ["A", "B", "C", "D"];

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        Upload & Analyze
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                        {step === "upload" && "Upload attendance sheet"}
                        {step === "metadata" && "Add session details"}
                        {step === "preview" && "Review data before analysis"}
                        {step === "analyzing" && "AI is processing..."}
                        {step === "results" && "Analysis complete"}
                    </p>
                </div>
                {step !== "upload" && (
                    <button
                        onClick={handleReset}
                        className="btn btn-secondary text-xs sm:text-sm py-2 px-3 flex-shrink-0"
                    >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                )}
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center overflow-x-auto pb-2">
                <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-full p-1">
                    {steps.map((label, index) => (
                        <div
                            key={label}
                            className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-medium transition-all flex-shrink-0 ${index === stepIndex
                                ? "bg-red-600 text-white"
                                : index < stepIndex
                                    ? "bg-red-100 text-red-600"
                                    : "bg-transparent text-gray-400"
                                }`}
                        >
                            {index < stepIndex ? <Check className="w-3 h-3" /> : index + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-700 flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-600 flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Step */}
            {step === "upload" && (
                <div className="card p-3 sm:p-6">
                    <div
                        {...getRootProps()}
                        className={`dropzone py-8 sm:py-12 ${isDragActive ? "dropzone-active" : ""}`}
                    >
                        <input {...getInputProps()} />
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 animate-spin mb-2 sm:mb-3" />
                                <p className="text-gray-500 text-xs sm:text-sm">Processing file...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                                </div>
                                <p className="font-medium text-gray-700 text-sm sm:text-base mb-1">
                                    {isDragActive ? "Drop your file here" : "Tap to upload file"}
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm mb-3">
                                    or drag and drop
                                </p>
                                <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs text-gray-400">
                                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                                        <FileSpreadsheet className="w-3 h-3" />
                                        CSV
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                                        <FileSpreadsheet className="w-3 h-3" />
                                        XLSX / XLS
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* File Requirements */}
                    <div className="mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-blue-600" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">File Requirements</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase mb-1.5">Required</h4>
                                <ul className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                                    <li>• Student Name</li>
                                    <li>• Roll Number</li>
                                    <li>• Bench ID</li>
                                    <li>• Present (Yes/No)</li>
                                </ul>
                            </div>
                            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase mb-1.5">Recommended</h4>
                                <ul className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                                    <li>• IP Address</li>
                                    <li>• Timestamp</li>
                                    <li>• Device Info</li>
                                </ul>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                <h4 className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase mb-1.5">Template</h4>
                                <a
                                    href="/sample-template.csv"
                                    download
                                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <FileSpreadsheet className="w-3 h-3" />
                                    Download sample →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metadata Step */}
            {step === "metadata" && (
                <div className="card p-3 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-red-600" />
                            Session Details
                        </h2>
                        {autoDetected.length > 0 && (
                            <span className="text-[10px] sm:text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Auto-detected
                            </span>
                        )}
                    </div>

                    {/* Auto-detection Banner */}
                    {autoDetected.length > 0 && (
                        <div className="mb-4 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-green-800">
                                        Auto-detected from sheet
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">
                                        {autoDetected.join(", ")} • Verify and adjust if needed
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Quality Indicators */}
                    {parsedData?.detectedMetadata && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full flex items-center gap-1 ${parsedData.detectedMetadata.hasIPColumn
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}>
                                <Wifi className="w-3 h-3" />
                                IP Column {parsedData.detectedMetadata.hasIPColumn ? "✓" : "✗"}
                            </span>
                            <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full flex items-center gap-1 ${parsedData.detectedMetadata.hasBenchIdColumn
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}>
                                <MapPin className="w-3 h-3" />
                                Bench ID {parsedData.detectedMetadata.hasBenchIdColumn ? "✓" : "✗"}
                            </span>
                            {parsedData.detectedMetadata.presentCount > 0 && (
                                <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {parsedData.detectedMetadata.presentCount} Present
                                </span>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Class */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                Class *
                                {autoDetected.includes("Class") && (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                )}
                            </label>
                            <div className="relative">
                                <select
                                    value={metadata.className}
                                    onChange={(e) => setMetadata({ ...metadata, className: e.target.value })}
                                    className={`input text-xs sm:text-sm py-2 appearance-none pr-8 ${autoDetected.includes("Class") ? "border-green-300 bg-green-50" : ""
                                        }`}
                                >
                                    <option value="">Select</option>
                                    {classOptions.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    {/* Add detected value if not in list */}
                                    {metadata.className && !classOptions.includes(metadata.className) && (
                                        <option value={metadata.className}>{metadata.className}</option>
                                    )}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Section */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                Section *
                                {autoDetected.includes("Section") && (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                )}
                            </label>
                            <div className="relative">
                                <select
                                    value={metadata.section}
                                    onChange={(e) => setMetadata({ ...metadata, section: e.target.value })}
                                    className={`input text-xs sm:text-sm py-2 appearance-none pr-8 ${autoDetected.includes("Section") ? "border-green-300 bg-green-50" : ""
                                        }`}
                                >
                                    <option value="">Select</option>
                                    {sectionOptions.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                    {/* Add detected value if not in list */}
                                    {metadata.section && !sectionOptions.includes(metadata.section) && (
                                        <option value={metadata.section}>{metadata.section}</option>
                                    )}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                Subject
                                {autoDetected.includes("Subject") && (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                )}
                            </label>
                            <input
                                type="text"
                                value={metadata.subject}
                                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                                placeholder="e.g., Data Structures"
                                className={`input text-xs sm:text-sm py-2 ${autoDetected.includes("Subject") ? "border-green-300 bg-green-50" : ""
                                    }`}
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Date
                            </label>
                            <input
                                type="date"
                                value={metadata.date}
                                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                                className="input text-xs sm:text-sm py-2"
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Time
                            </label>
                            <input
                                type="time"
                                value={metadata.time}
                                onChange={(e) => setMetadata({ ...metadata, time: e.target.value })}
                                className="input text-xs sm:text-sm py-2"
                            />
                        </div>

                        {/* Room */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Room
                                {autoDetected.includes("Room") && (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                )}
                            </label>
                            <input
                                type="text"
                                value={metadata.room}
                                onChange={(e) => setMetadata({ ...metadata, room: e.target.value })}
                                placeholder="e.g., LH-201"
                                className={`input text-xs sm:text-sm py-2 ${autoDetected.includes("Room") ? "border-green-300 bg-green-50" : ""
                                    }`}
                            />
                        </div>
                    </div>

                    {/* File Info */}
                    <div className="mt-4 p-2.5 bg-gray-50 rounded-lg flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <FileSpreadsheet className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file?.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                {parsedData?.rows.length} students • {parsedData?.headers.length} columns
                            </p>
                        </div>
                        <Users className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
                        <button onClick={handleReset} className="btn btn-secondary text-xs sm:text-sm w-full sm:w-auto">
                            Back
                        </button>
                        <button
                            onClick={() => setStep("preview")}
                            disabled={!metadata.className || !metadata.section}
                            className="btn btn-primary text-xs sm:text-sm w-full sm:w-auto disabled:opacity-50"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Step */}
            {step === "preview" && parsedData && (
                <div className="space-y-3 sm:space-y-4">
                    {/* Session Summary */}
                    <div className="card p-3 sm:p-4 bg-gradient-to-r from-red-50 to-white border-red-100">
                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-gray-600">{metadata.className}-{metadata.section}</span>
                            </div>
                            {metadata.subject && (
                                <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-red-600" />
                                    <span className="text-gray-600">{metadata.subject}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-gray-600">{new Date(metadata.date).toLocaleDateString()}</span>
                            </div>
                            {metadata.room && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                                    <span className="text-gray-600">{metadata.room}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DataPreview data={parsedData} fileName={file?.name || "file"} />

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <button onClick={() => setStep("metadata")} className="btn btn-secondary text-sm w-full sm:w-auto">
                            Back
                        </button>
                        <button onClick={handleAnalyze} className="btn btn-primary text-sm w-full sm:w-auto">
                            <Sparkles className="w-4 h-4" />
                            Start Analysis
                        </button>
                    </div>
                </div>
            )}

            {/* Analyzing Step */}
            {step === "analyzing" && (
                <div className="card p-6 sm:p-10 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-2 border-red-300 rounded-full animate-ping opacity-20" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        Analyzing Attendance
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm text-center max-w-xs px-4">
                        AI is examining seating patterns, IP addresses, and behavioral anomalies
                    </p>

                    {/* Analysis Steps */}
                    <div className="mt-6 space-y-2 w-full max-w-xs">
                        {["Parsing data...", "Checking IP patterns...", "Analyzing seating...", "Detecting anomalies..."].map((text, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results Step */}
            {step === "results" && analysisResult && (
                <AnalysisResults
                    result={analysisResult}
                    metadata={metadata}
                    onReset={handleReset}
                />
            )}
        </div>
    );
}
