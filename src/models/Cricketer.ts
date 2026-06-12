import mongoose, { Schema, Document, Model } from "mongoose";
import {
  CricketCategory,
  RegistrationSource,
  REGISTRATION_SOURCES,
  JERSEY_SIZES,
  JERSEY_NUMBER_MIN,
  JERSEY_NUMBER_MAX,
  AGE_MIN,
  AGE_MAX,
  JerseySize,
} from "@/lib/constants";
import { normalizeTextInput } from "@/lib/gujarati-normalize";
import { normalizeMobileNumber } from "@/lib/contact-uniqueness";

const GUJARATI_TEXT_FIELDS = [
  "first_name",
  "middle_name",
  "last_name",
  "address",
  "jersey_name",
] as const;

export interface ICricketer extends Document {
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string;
  age?: number;
  contact_number_1: string;
  contact_number_2?: string;
  jersey_size: JerseySize | "";
  jersey_number?: number;
  jersey_name: string;
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
    age: {
      type: Number,
      min: AGE_MIN,
      max: AGE_MAX,
    },
    contact_number_1: { type: String, required: true, trim: true },
    contact_number_2: { type: String, trim: true, default: "" },
    jersey_size: {
      type: String,
      enum: [...JERSEY_SIZES, ""],
      default: "",
    },
    jersey_number: {
      type: Number,
      min: JERSEY_NUMBER_MIN,
      max: JERSEY_NUMBER_MAX,
    },
    jersey_name: { type: String, trim: true, default: "", maxlength: 30 },
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
CricketerSchema.index({ contact_number_1: 1 }, { unique: true });
CricketerSchema.index({ contact_number_2: 1 });
CricketerSchema.index({ cricket_categories: 1 });
CricketerSchema.index({ capacity_roles: 1 });
CricketerSchema.index({ registration_source: 1 });
CricketerSchema.index({ jersey_number: 1 });
CricketerSchema.index({ created_at: -1 });

CricketerSchema.pre("save", function normalizeGujaratiFields() {
  for (const field of GUJARATI_TEXT_FIELDS) {
    const value = this[field];
    if (typeof value === "string") {
      this[field] = normalizeTextInput(value);
    }
  }

  if (typeof this.contact_number_1 === "string" && this.contact_number_1) {
    this.contact_number_1 = normalizeMobileNumber(this.contact_number_1);
  }
  if (typeof this.contact_number_2 === "string" && this.contact_number_2) {
    this.contact_number_2 = normalizeMobileNumber(this.contact_number_2);
  }
});

const Cricketer: Model<ICricketer> =
  mongoose.models.Cricketer ||
  mongoose.model<ICricketer>("Cricketer", CricketerSchema);

export default Cricketer;
