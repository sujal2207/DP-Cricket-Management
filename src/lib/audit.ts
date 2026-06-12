import { connectDB } from "@/lib/db";
import AuditLog, { AuditAction } from "@/models/AuditLog";

interface LogAuditParams {
  cricketerId: string;
  cricketerName: string;
  action: AuditAction;
  performedBy: string;
  changes?: Record<string, unknown>;
}

export async function logAudit({
  cricketerId,
  cricketerName,
  action,
  performedBy,
  changes,
}: LogAuditParams): Promise<void> {
  await connectDB();
  await AuditLog.create({
    cricketer_id: cricketerId,
    cricketer_name: cricketerName,
    action,
    changes,
    performed_by: performedBy,
  });
}
