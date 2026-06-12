import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  message: string;
  cricketer_id: string;
  cricketer_name: string;
  read: boolean;
  created_at: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    message: { type: String, required: true },
    cricketer_id: { type: String, required: true },
    cricketer_name: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

NotificationSchema.index({ read: 1, created_at: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
