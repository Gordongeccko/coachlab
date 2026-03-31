import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email redan registrerad" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { name, email, password: hashed } });
  return NextResponse.json({ id: user.id, email: user.email });
}
