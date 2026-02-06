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
    const displayRows = data.rows.slice(0, 5);
    const hasMoreRows = data.rows.length > 5;

    // Show only first 4 columns on mobile, all on desktop
    const mobileHeaders = data.headers.slice(0, 4);

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            <div className="p-2.5 sm:p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{fileName}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            {data.rows.length} rows • {data.headers.length} cols
                        </p>
                    </div>
                </div>
                <span className="badge badge-info text-[10px] sm:text-xs flex items-center gap-1 flex-shrink-0">
                    <Table className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Preview
                </span>
            </div>

            {/* Mobile Table - Simplified */}
            <div className="sm:hidden overflow-x-auto">
                <table className="w-full text-[10px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-2 py-2 text-left text-[9px] font-semibold text-gray-500 uppercase">#</th>
                            {mobileHeaders.map((header, index) => (
                                <th key={index} className="px-2 py-2 text-left text-[9px] font-semibold text-gray-500 uppercase truncate max-w-[60px]">
                                    {header.length > 8 ? header.substring(0, 8) + "..." : header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-100">
                                <td className="px-2 py-1.5 text-gray-400">{rowIndex + 1}</td>
                                {mobileHeaders.map((header, colIndex) => (
                                    <td key={colIndex} className="px-2 py-1.5 text-gray-700 truncate max-w-[60px]">
                                        {row[header] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Desktop Table - Full */}
            <div className="hidden sm:block table-container border-0 rounded-none">
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

            {/* More rows indicator */}
            {hasMoreRows && (
                <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-[10px] sm:text-xs text-gray-500">
                        +{data.rows.length - 5} more rows
                    </p>
                </div>
            )}
        </div>
    );
}
