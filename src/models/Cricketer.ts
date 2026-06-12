import mongoose, { Schema, Document, Model } from "mongoose";
import {
  CricketCategory,
  RegistrationSource,
  REGISTRATION_SOURCES,
} from "@/lib/constants";
import { normalizeTextInput } from "@/lib/gujarati-normalize";

const GUJARATI_TEXT_FIELDS = [
  "first_name",
  "middle_name",
  "last_name",
  "address",
] as const;

export interface ICricketer extends Document {
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string;
  contact_number_1: string;
  contact_number_2?: string;
  cricket_categories: CricketCategory[];
  capacity_roles: string[];
  registration_source: RegistrationSource;
  created_at: Date;
  updated_at: Date;
}

const CricketerSchema = new Schema<ICricketer>(
  {
    first_name: { type: String, required: true, trim: true },
    middle_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contact_number_1: { type: String, required: true, trim: true },
    contact_number_2: { type: String, trim: true, default: "" },
    cricket_categories: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 2,
        message: "Must select 1-2 cricket categories",
      },
    },
    capacity_roles: {
      type: [String],
      default: [],
    },
    registration_source: {
      type: String,
      enum: Object.values(REGISTRATION_SOURCES),
      default: REGISTRATION_SOURCES.ADMIN,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

CricketerSchema.index({ first_name: "text", middle_name: "text", last_name: "text" });
CricketerSchema.index({ contact_number_1: 1 });
CricketerSchema.index({ cricket_categories: 1 });
CricketerSchema.index({ capacity_roles: 1 });
CricketerSchema.index({ registration_source: 1 });
CricketerSchema.index({ created_at: -1 });

CricketerSchema.pre("save", function normalizeGujaratiFields() {
  for (const field of GUJARATI_TEXT_FIELDS) {
    const value = this[field];
    if (typeof value === "string") {
      this[field] = normalizeTextInput(value);
    }
  }
});

const Cricketer: Model<ICricketer> =
  mongoose.models.Cricketer ||
  mongoose.model<ICricketer>("Cricketer", CricketerSchema);

export default Cricketer;
