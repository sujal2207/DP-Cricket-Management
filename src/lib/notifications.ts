import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function createNotification(
  cricketerId: string,
  cricketerName: string
): Promise<void> {
  await connectDB();
  await Notification.create({
    message: `New public registration from ${cricketerName}`,
    cricketer_id: cricketerId,
    cricketer_name: cricketerName,
    read: false,
  });
}

export async function getUnreadCount(): Promise<number> {
  await connectDB();
  return Notification.countDocuments({ read: false });
}

export async function markAllRead(): Promise<void> {
  await connectDB();
  await Notification.updateMany({ read: false }, { read: true });
}

export async function markOneRead(id: string): Promise<boolean> {
  await connectDB();
  const updated = await Notification.findByIdAndUpdate(id, { read: true });
  return !!updated;
}

export async function deleteNotification(id: string): Promise<boolean> {
  await connectDB();
  const deleted = await Notification.findByIdAndDelete(id);
  return !!deleted;
}

export async function deleteAllNotifications(): Promise<number> {
  await connectDB();
  const result = await Notification.deleteMany({});
  return result.deletedCount;
}
