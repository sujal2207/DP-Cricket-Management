import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";
import { receiptRequestSchema } from "@/lib/validation";
import { getRegistrationBranding } from "@/lib/registration-branding";
import { generateRegistrationReceiptPdf } from "@/lib/pdf-receipt";
import { mapCricketerToReceiptData } from "@/lib/pdf-receipt-shared";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { gu } from "@/lib/translations/publicRegistrationGu";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`public-receipt:${ip}`, 20, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: gu.errors.rateLimit },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = receiptRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: gu.errors.receiptInvalid },
        { status: 400 }
      );
    }

    const { id, contact_number_1 } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: gu.errors.receiptNotFound }, { status: 404 });
    }

    await connectDB();

    const cricketer = await Cricketer.findOne({
      _id: id,
      contact_number_1,
    }).lean();

    if (!cricketer) {
      return NextResponse.json({ error: gu.errors.receiptNotFound }, { status: 404 });
    }

    const branding = await getRegistrationBranding();
    const receiptData = mapCricketerToReceiptData(
      cricketer as Record<string, unknown>
    );
    const pdfBytes = await generateRegistrationReceiptPdf(receiptData, branding);

    const filename = `dp-registration-receipt-${id.slice(-8)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Registration receipt error:", error);
    return NextResponse.json({ error: gu.errors.receiptFailed }, { status: 500 });
  }
}
