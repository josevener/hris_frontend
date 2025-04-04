import { NextResponse } from "next/server";
import { getCookie } from "@/lib/auth";

export async function GET() {
  const token = await getCookie("auth_token");
  const userCookie = await getCookie("user");
  const user = userCookie ? JSON.parse(userCookie) : null;

  console.log("Auth data - Token:", token, "User:", user);
  return NextResponse.json({ token, user });
}
