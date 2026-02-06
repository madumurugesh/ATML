import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";

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

function detectMetadataFromData(
    headers: string[],
    rows: Record<string, string>[]
): DetectedMetadata {
    const metadata: DetectedMetadata = {
        className: null,
        section: null,
        subject: null,
        room: null,
        date: null,
        totalStudents: rows.length,
        presentCount: 0,
        absentCount: 0,
        hasIPColumn: false,
        hasBenchIdColumn: false,
    };

    // Normalize headers for matching
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

    // Check for IP column
    metadata.hasIPColumn = normalizedHeaders.some((h) =>
        ["ip", "ip address", "ipaddress", "ip_address"].includes(h)
    );

    // Check for Bench ID column
    metadata.hasBenchIdColumn = normalizedHeaders.some((h) =>
        ["bench", "bench id", "benchid", "bench_id", "seat", "seat id"].includes(h)
    );

    // Find class column
    const classColumnIndex = normalizedHeaders.findIndex((h) =>
        ["class", "class name", "classname", "department", "dept", "branch"].includes(h)
    );

    // Find section column
    const sectionColumnIndex = normalizedHeaders.findIndex((h) =>
        ["section", "sec", "division", "div"].includes(h)
    );

    // Find subject column
    const subjectColumnIndex = normalizedHeaders.findIndex((h) =>
        ["subject", "course", "course name", "subject name", "paper"].includes(h)
    );

    // Find room column
    const roomColumnIndex = normalizedHeaders.findIndex((h) =>
        ["room", "room no", "room number", "hall", "lab", "venue", "location"].includes(h)
    );

    // Find present/attendance column
    const presentColumnIndex = normalizedHeaders.findIndex((h) =>
        ["present", "attendance", "status", "attended", "att"].includes(h)
    );

    // Extract class name (take most common value)
    if (classColumnIndex !== -1) {
        const classHeader = headers[classColumnIndex];
        const classValues = rows.map((r) => r[classHeader]).filter(Boolean);
        metadata.className = getMostCommonValue(classValues);
    } else {
        // Try to extract from Bench ID (format: CSE-A-R1C1)
        const benchHeader = headers.find((h) =>
            ["bench id", "benchid", "bench_id", "bench"].includes(h.toLowerCase())
        );
        if (benchHeader) {
            const firstBench = rows[0]?.[benchHeader];
            if (firstBench) {
                const parts = firstBench.split("-");
                if (parts.length >= 2) {
                    metadata.className = parts[0];
                    metadata.section = parts[1];
                }
            }
        }
    }

    // Extract section
    if (sectionColumnIndex !== -1 && !metadata.section) {
        const sectionHeader = headers[sectionColumnIndex];
        const sectionValues = rows.map((r) => r[sectionHeader]).filter(Boolean);
        metadata.section = getMostCommonValue(sectionValues);
    }

    // Extract subject
    if (subjectColumnIndex !== -1) {
        const subjectHeader = headers[subjectColumnIndex];
        const subjectValues = rows.map((r) => r[subjectHeader]).filter(Boolean);
        metadata.subject = getMostCommonValue(subjectValues);
    }

    // Extract room
    if (roomColumnIndex !== -1) {
        const roomHeader = headers[roomColumnIndex];
        const roomValues = rows.map((r) => r[roomHeader]).filter(Boolean);
        metadata.room = getMostCommonValue(roomValues);
    }

    // Count present/absent
    if (presentColumnIndex !== -1) {
        const presentHeader = headers[presentColumnIndex];
        rows.forEach((row) => {
            const value = (row[presentHeader] || "").toLowerCase().trim();
            if (["yes", "y", "1", "true", "present", "p"].includes(value)) {
                metadata.presentCount++;
            } else if (["no", "n", "0", "false", "absent", "a"].includes(value)) {
                metadata.absentCount++;
            }
        });
    }

    return metadata;
}

function getMostCommonValue(arr: string[]): string | null {
    if (arr.length === 0) return null;

    const frequency: Record<string, number> = {};
    let maxCount = 0;
    let mostCommon = arr[0];

    arr.forEach((value) => {
        const normalized = value.trim();
        if (normalized) {
            frequency[normalized] = (frequency[normalized] || 0) + 1;
            if (frequency[normalized] > maxCount) {
                maxCount = frequency[normalized];
                mostCommon = normalized;
            }
        }
    });

    return mostCommon;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let headers: string[] = [];
        let rows: Record<string, string>[] = [];

        if (fileName.endsWith(".csv")) {
            // Parse CSV
            const csvText = buffer.toString("utf-8");
            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
            });

            headers = result.meta.fields || [];
            rows = result.data as Record<string, string>[];
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            // Parse Excel
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
                header: 1,
                raw: false,
            });

            if (jsonData.length > 0) {
                const headerRow = jsonData[0] as unknown as string[];
                headers = headerRow.map((h) => (typeof h === "string" ? h.trim() : String(h)));

                rows = jsonData.slice(1).map((row) => {
                    const rowArray = row as unknown as string[];
                    const rowObj: Record<string, string> = {};
                    headers.forEach((header, index) => {
                        rowObj[header] = rowArray[index] !== undefined ? String(rowArray[index]) : "";
                    });
                    return rowObj;
                });
            }
        } else {
            return NextResponse.json(
                { error: "Unsupported file format. Please use CSV or Excel files." },
                { status: 400 }
            );
        }

        // Filter out empty rows
        rows = rows.filter((row) =>
            Object.values(row).some((value) => value && value.trim() !== "")
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "No data found in the file" }, { status: 400 });
        }

        // Detect metadata from the data
        const detectedMetadata = detectMetadataFromData(headers, rows);

        return NextResponse.json({
            headers,
            rows,
            fileName: file.name,
            rowCount: rows.length,
            detectedMetadata,
        });
    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}
