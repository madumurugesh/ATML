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
} from "lucide-react";
import DataPreview from "./DataPreview";
import AnalysisResults from "./AnalysisResults";

interface ParsedData {
    headers: string[];
    rows: Record<string, string>[];
}

interface AnalysisResult {
    totalStudents: number;
    presentCount: number;
    flaggedCount: number;
    proxyProbability: number;
    insights: string[];
    flaggedEntries: {
        studentName: string;
        rollNumber: string;
        benchId: string;
        reason: string;
        confidence: number;
    }[];
}

type UploadStep = "upload" | "preview" | "analyzing" | "results";

export default function UploadSection() {
    const [step, setStep] = useState<UploadStep>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setError(null);
        setIsLoading(true);

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
            setStep("preview");
        } catch (err) {
            setError("Failed to parse the file. Check the format.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                body: JSON.stringify({ data: parsedData }),
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
    };

    const steps = ["Upload", "Preview", "Analyze", "Results"];
    const stepIndex = ["upload", "preview", "analyzing", "results"].indexOf(step);

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Upload Sheet</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Upload a CSV or Excel file to analyze
                    </p>
                </div>
                {step !== "upload" && (
                    <button onClick={handleReset} className="btn btn-secondary text-sm py-2">
                        <X className="w-4 h-4" />
                        Reset
                    </button>
                )}
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-1">
                {steps.map((label, index) => (
                    <div key={label} className="flex items-center">
                        <div
                            className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${index === stepIndex
                                ? "bg-red-600 text-white"
                                : index < stepIndex
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {index < stepIndex ? <Check className="w-3 h-3" /> : index + 1}
                        </div>
                        <span
                            className={`ml-1.5 text-xs ${index === stepIndex ? "text-gray-900 font-medium" : "text-gray-400"
                                }`}
                        >
                            {label}
                        </span>
                        {index < 3 && (
                            <div
                                className={`w-8 h-0.5 mx-2 ${index < stepIndex ? "bg-red-200" : "bg-gray-200"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Step */}
            {step === "upload" && (
                <div className="card p-6">
                    <div
                        {...getRootProps()}
                        className={`dropzone py-12 ${isDragActive ? "dropzone-active" : ""}`}
                    >
                        <input {...getInputProps()} />
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                                <p className="text-gray-500 text-sm">Processing...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Upload className="w-6 h-6 text-red-600" />
                                </div>
                                <p className="font-medium text-gray-700 mb-1">
                                    {isDragActive ? "Drop here" : "Drop your file here"}
                                </p>
                                <p className="text-gray-400 text-sm mb-3">or click to browse</p>
                                <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <FileSpreadsheet className="w-3 h-3" />
                                        CSV
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <FileSpreadsheet className="w-3 h-3" />
                                        XLSX
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 text-sm mb-2">Required Columns</h3>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Student Name</li>
                                <li>• Roll Number</li>
                                <li>• Bench ID</li>
                                <li>• Present (Yes/No)</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 text-sm mb-2">Sample</h3>
                            <a
                                href="/sample-template.csv"
                                download
                                className="text-xs text-red-600 hover:underline"
                            >
                                Download sample template →
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Step */}
            {step === "preview" && parsedData && (
                <div className="space-y-4">
                    <DataPreview data={parsedData} fileName={file?.name || "file"} />
                    <div className="flex justify-end gap-3">
                        <button onClick={handleReset} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleAnalyze} className="btn btn-primary">
                            <Sparkles className="w-4 h-4" />
                            Analyze
                        </button>
                    </div>
                </div>
            )}

            {/* Analyzing Step */}
            {step === "analyzing" && (
                <div className="card p-12 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-red-600 animate-pulse" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        Analyzing...
                    </h2>
                    <p className="text-gray-500 text-sm text-center max-w-sm">
                        AI is examining attendance patterns to detect anomalies
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        This may take a few seconds
                    </div>
                </div>
            )}

            {/* Results Step */}
            {step === "results" && analysisResult && (
                <AnalysisResults result={analysisResult} onReset={handleReset} />
            )}
        </div>
    );
}
