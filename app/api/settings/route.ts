import { NextResponse } from "next/server";
import fs from "fs/promises";

const SETTINGS_FILE = "settings.json";

export async function GET() {
  const data = await fs.readFile(SETTINGS_FILE, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

export async function POST(req: Request) {
  const body = await req.json();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}
