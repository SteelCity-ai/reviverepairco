import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Clerk webhook received" }, { status: 200 });
}
