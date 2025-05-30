import { NextResponse } from "next/server";
import axios from "axios";
import { setToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
      {
        email,
        password,
      }
    );

    const data = response.data;

    // Set cookies using setToken helper
    await setToken("auth_token", data.access_token);
    await setToken("user", JSON.stringify(data.user));

    console.log(
      "Login successful - Token:",
      data.access_token,
      "User:",
      data.user
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 401 });
  }
}
