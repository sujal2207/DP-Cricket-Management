import mongoose, { Schema, Document, Model } from "mongoose";
import { normalizeGujaratiText } from "@/lib/gujarati-normalize";

const GUJARATI_BRANDING_FIELDS = [
  "organization_name_gu",
  "tournament_title_gu",
  "tournament_short_gu",
  "form_subtitle_gu",
  "hero_description_gu",
  "availability_notice_gu",
  "fee_notice_gu",
] as const;

export interface IRegistrationBranding extends Document {
  key: string;
  organization_name_gu: string;
  tournament_year: string;
  tournament_title_gu: string;
  tournament_short_gu: string;
  form_subtitle_gu?: string;
  hero_description_gu?: string;
  availability_notice_gu: string;
  fee_notice_gu: string;
  updated_by?: string;
  updated_at: Date;
  created_at: Date;
}

const RegistrationBrandingSchema = new Schema<IRegistrationBranding>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    organization_name_gu: { type: String, required: true },
    tournament_year: { type: String, required: true },
    tournament_title_gu: { type: String, required: true },
    tournament_short_gu: { type: String, required: true },
    form_subtitle_gu: { type: String },
    hero_description_gu: { type: String },
    availability_notice_gu: { type: String, required: true },
    fee_notice_gu: { type: String, required: true },
    updated_by: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

RegistrationBrandingSchema.pre("save", function normalizeBrandingGujarati() {
  for (const field of GUJARATI_BRANDING_FIELDS) {
    const value = this[field];
    if (typeof value === "string") {
      this[field] = normalizeGujaratiText(value);
    }
  }
});

const RegistrationBranding: Model<IRegistrationBranding> =
  mongoose.models.RegistrationBranding ||
  mongoose.model<IRegistrationBranding>(
    "RegistrationBranding",
    RegistrationBrandingSchema
  );

export default RegistrationBranding;
