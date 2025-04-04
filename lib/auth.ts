"use server";

import { cookies } from "next/headers";

export async function setToken(name: string, token: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: name,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);

  return cookie ? cookie.value : null;
}
