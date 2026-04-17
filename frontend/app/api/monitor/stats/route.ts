import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/monitor/stats`, {
      next: { revalidate: 0 } // Disable caching to get fresh stats
    });
    
    if (!response.ok) {
        return NextResponse.json({ error: "Backend Error" }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy Error to ${BACKEND_URL}/api/monitor/stats:`, error);
    return NextResponse.json({ 
      error: "Backend monitor offline",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
