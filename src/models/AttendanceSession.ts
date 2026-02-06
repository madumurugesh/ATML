import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendanceEntry {
    studentName: string;
    rollNumber: string;
    benchId?: string;
    present: boolean;
    flagged: boolean;
    flagReason?: string;
    confidence?: number;
}

export interface IAttendanceSession extends Document {
    date: Date;
    className: string;
    section: string;
    subject?: string;
    entries: IAttendanceEntry[];
    analysis: {
        totalStudents: number;
        presentCount: number;
        flaggedCount: number;
        proxyProbability: number;
        insights: string[];
    };
    rawData?: {
        headers: string[];
        rows: Record<string, string>[];
    };
    status: "clean" | "suspicious" | "flagged";
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceEntrySchema = new Schema<IAttendanceEntry>(
    {
        studentName: { type: String, required: true },
        rollNumber: { type: String, required: true },
        benchId: { type: String },
        present: { type: Boolean, default: false },
        flagged: { type: Boolean, default: false },
        flagReason: { type: String },
        confidence: { type: Number, min: 0, max: 1 },
    },
    { _id: false }
);

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        className: {
            type: String,
            required: [true, "Class name is required"],
            trim: true,
        },
        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        entries: [AttendanceEntrySchema],
        analysis: {
            totalStudents: { type: Number, default: 0 },
            presentCount: { type: Number, default: 0 },
            flaggedCount: { type: Number, default: 0 },
            proxyProbability: { type: Number, default: 0, min: 0, max: 1 },
            insights: [{ type: String }],
        },
        rawData: {
            headers: [{ type: String }],
            rows: [{ type: Schema.Types.Mixed }],
        },
        status: {
            type: String,
            enum: ["clean", "suspicious", "flagged"],
            default: "clean",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
AttendanceSessionSchema.index({ date: -1 });
AttendanceSessionSchema.index({ className: 1, section: 1 });
AttendanceSessionSchema.index({ status: 1 });

// Virtual for formatted date
AttendanceSessionSchema.virtual("formattedDate").get(function () {
    return this.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
});

export const AttendanceSession: Model<IAttendanceSession> =
    mongoose.models.AttendanceSession ||
    mongoose.model<IAttendanceSession>("AttendanceSession", AttendanceSessionSchema);
