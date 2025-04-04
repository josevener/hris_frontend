"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user");

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}
