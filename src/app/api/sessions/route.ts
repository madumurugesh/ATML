import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { AttendanceSession } from "@/models/AttendanceSession";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const className = searchParams.get("class");

        const query: Record<string, unknown> = {};
        if (status && status !== "all") {
            query.status = status;
        }
        if (className) {
            query.className = className;
        }

        const skip = (page - 1) * limit;

        const [sessions, total] = await Promise.all([
            AttendanceSession.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .select("-rawData -entries")
                .lean(),
            AttendanceSession.countDocuments(query),
        ]);

        return NextResponse.json({
            sessions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const session = new AttendanceSession(body);
        await session.save();

        return NextResponse.json(session, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}
