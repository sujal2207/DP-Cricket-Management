import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminEmailFromSession } from "@/lib/admin-credentials";
import {
  listManagedAdminUsers,
  createManagedAdminUser,
  getMainAdminInfo,
} from "@/lib/admin-users";
import { addAdminSchema } from "@/lib/admin-validation";





export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [mainAdmin, users] = await Promise.all([
      Promise.resolve(getMainAdminInfo()),
      listManagedAdminUsers(),
    ]);

    return NextResponse.json({ mainAdmin, users });
  } catch (error) {
    console.error("GET admin users error:", error);
    return NextResponse.json(
      { error: "Failed to load admin users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const createdBy = getAdminEmailFromSession(session);
    const user = await createManagedAdminUser(
      parsed.data.email,
      parsed.data.password,
      createdBy
    );

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add admin user";
    console.error("POST admin user error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
