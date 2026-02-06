import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
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
                // First row is headers
                const headerRow = jsonData[0] as unknown as string[];
                headers = headerRow.map((h) => (typeof h === "string" ? h.trim() : String(h)));

                // Rest are data rows
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

        // Filter out completely empty rows
        rows = rows.filter((row) =>
            Object.values(row).some((value) => value && value.trim() !== "")
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "No data found in the file" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            headers,
            rows,
            fileName: file.name,
            rowCount: rows.length,
        });
    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json(
            { error: "Failed to process file" },
            { status: 500 }
        );
    }
}
