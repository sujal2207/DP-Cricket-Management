import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteManagedAdminUser } from "@/lib/admin-users";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteManagedAdminUser(id);

    return NextResponse.json({ success: true, message: "Admin user deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete admin user";
    console.error("DELETE admin user error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
