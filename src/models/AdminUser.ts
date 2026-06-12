import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  password_hash: string;
  created_by: string;
  created_at: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: true },
    created_by: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

export default AdminUser;
