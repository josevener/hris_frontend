"use server";

import { NextResponse } from "next/server";
import { setToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { name, email, password, password_confirmation } = await request.json();

  const response = await fetch("http://127.0.0.1:8000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { message: data.message || "Registration failed" },
      { status: response.status }
    );
  }

  const userString =
    typeof data.user === "string" ? data.user : JSON.stringify(data.user);
  await setToken("auth_token", data.access_token);
  await setToken("user", userString);

  return NextResponse.json(data, { status: 200 });
}
