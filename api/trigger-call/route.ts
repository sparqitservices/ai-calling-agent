import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST() {
  exec("node callAgent.js");
  return NextResponse.json({ ok: true });
}
