import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
    name: string;
    rollNumber: string;
    email?: string;
    class: string;
    section: string;
    benchId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
    {
        name: {
            type: String,
            required: [true, "Student name is required"],
            trim: true,
        },
        rollNumber: {
            type: String,
            required: [true, "Roll number is required"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        class: {
            type: String,
            required: [true, "Class is required"],
            trim: true,
        },
        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
        },
        benchId: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
StudentSchema.index({ rollNumber: 1 });
StudentSchema.index({ class: 1, section: 1 });

export const Student: Model<IStudent> =
    mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
