import { NextRequest, NextResponse } from "next/server";
import { analyzeAttendance, AttendanceData } from "@/lib/gemini";
import connectDB from "@/lib/mongodb";
import { AttendanceSession } from "@/models/AttendanceSession";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { data, className, section, subject } = body as {
            data: AttendanceData;
            className?: string;
            section?: string;
            subject?: string;
        };

        if (!data || !data.headers || !data.rows) {
            return NextResponse.json(
                { error: "Invalid data format" },
                { status: 400 }
            );
        }

        // Analyze with Gemini AI
        const analysisResult = await analyzeAttendance(data);

        // Determine session status based on proxy probability
        let status: "clean" | "suspicious" | "flagged" = "clean";
        if (analysisResult.proxyProbability >= 0.5) {
            status = "flagged";
        } else if (analysisResult.proxyProbability >= 0.2) {
            status = "suspicious";
        }

        // Try to save to MongoDB if available
        try {
            await connectDB();

            // Find name and roll headers
            const nameHeader = data.headers.find(
                (h) => h.toLowerCase().includes("name") || h.toLowerCase().includes("student")
            );
            const rollHeader = data.headers.find(
                (h) => h.toLowerCase().includes("roll") || h.toLowerCase().includes("id")
            );
            const benchHeader = data.headers.find(
                (h) => h.toLowerCase().includes("bench") || h.toLowerCase().includes("seat")
            );
            const presentHeader = data.headers.find(
                (h) => h.toLowerCase().includes("present") || h.toLowerCase().includes("attendance")
            );

            // Create entries from data
            const entries = data.rows.map((row) => {
                const rollNumber = rollHeader ? row[rollHeader] || "" : "";
                const flaggedEntry = analysisResult.flaggedEntries.find(
                    (f) => f.rollNumber === rollNumber
                );

                const presentValue = presentHeader ? row[presentHeader]?.toLowerCase() : "";
                const isPresent =
                    presentValue === "yes" ||
                    presentValue === "1" ||
                    presentValue === "true" ||
                    presentValue === "p";

                return {
                    studentName: nameHeader ? row[nameHeader] || "Unknown" : "Unknown",
                    rollNumber,
                    benchId: benchHeader ? row[benchHeader] : undefined,
                    present: isPresent,
                    flagged: !!flaggedEntry,
                    flagReason: flaggedEntry?.reason,
                    confidence: flaggedEntry?.confidence,
                };
            });

            // Create session
            const session = new AttendanceSession({
                date: new Date(),
                className: className || "Unknown",
                section: section || "A",
                subject: subject || undefined,
                entries,
                analysis: {
                    totalStudents: analysisResult.totalStudents,
                    presentCount: analysisResult.presentCount,
                    flaggedCount: analysisResult.flaggedCount,
                    proxyProbability: analysisResult.proxyProbability,
                    insights: analysisResult.insights,
                },
                rawData: data,
                status,
            });

            await session.save();
            console.log("Session saved to database:", session._id);
        } catch (dbError) {
            console.warn("Could not save to database:", dbError);
            // Continue without database - analysis still works
        }

        return NextResponse.json({
            ...analysisResult,
            status,
        });
    } catch (error) {
        console.error("Error analyzing attendance:", error);
        return NextResponse.json(
            { error: "Failed to analyze attendance data" },
            { status: 500 }
        );
    }
}
