"use server"
import { cookies } from 'next/headers';
import { AppUser } from "./userModel";

export async function saveUserToCookies(user: AppUser) {
  const safeUser = {
    class: user.class,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    questions: user.questions ?? [],
  };

  const cookieStore = await cookies();
  cookieStore.set("user", JSON.stringify(safeUser), {
    path: "/",
    maxAge: 60 * 60 * 24 * 24, // 7 days in seconds
    httpOnly: false, // Set to true for better security if you don't need client access
    sameSite: 'strict'
  });
}

export async function getUserFromCookies() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user");
}