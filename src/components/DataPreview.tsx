"use client";

import { FileSpreadsheet, Table } from "lucide-react";

interface DataPreviewProps {
    data: {
        headers: string[];
        rows: Record<string, string>[];
    };
    fileName: string;
}

export default function DataPreview({ data, fileName }: DataPreviewProps) {
    const displayRows = data.rows.slice(0, 8);
    const hasMoreRows = data.rows.length > 8;

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileSpreadsheet className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{fileName}</p>
                        <p className="text-xs text-gray-500">
                            {data.rows.length} rows • {data.headers.length} columns
                        </p>
                    </div>
                </div>
                <span className="badge badge-info flex items-center gap-1">
                    <Table className="w-3 h-3" />
                    Preview
                </span>
            </div>

            {/* Table */}
            <div className="table-container border-0 rounded-none">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="w-10">#</th>
                            {data.headers.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className="text-gray-400 text-xs">{rowIndex + 1}</td>
                                {data.headers.map((header, colIndex) => (
                                    <td key={colIndex} className="text-sm">
                                        {row[header] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* More rows */}
            {hasMoreRows && (
                <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        +{data.rows.length - 8} more rows
                    </p>
                </div>
            )}
        </div>
    );
}
