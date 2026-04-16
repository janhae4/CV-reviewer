import { NextRequest, NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward to Backend Service
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Backend communication failed" }, { status: 500 });
  }
}
