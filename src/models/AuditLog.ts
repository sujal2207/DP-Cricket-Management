import mongoose, { Schema, Document, Model } from "mongoose";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface IAuditLog extends Document {
  cricketer_id: string;
  cricketer_name: string;
  action: AuditAction;
  changes?: Record<string, unknown>;
  performed_by: string;
  created_at: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    cricketer_id: { type: String, required: true },
    cricketer_name: { type: String, required: true },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    changes: { type: Schema.Types.Mixed },
    performed_by: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

AuditLogSchema.index({ created_at: -1 });
AuditLogSchema.index({ cricketer_id: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
