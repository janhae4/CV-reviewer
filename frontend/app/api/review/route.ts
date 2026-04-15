import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Forward to Backend Service
    const response = await fetch(`${BACKEND_URL}/api/review`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy Error to ${BACKEND_URL}:`, error);
    return NextResponse.json({ 
      error: "Backend communication failed", 
      details: error instanceof Error ? error.message : String(error),
      target: BACKEND_URL
    }, { status: 500 });
  }
}
