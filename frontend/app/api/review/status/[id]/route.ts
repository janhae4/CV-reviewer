import { NextRequest, NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetch(`${BACKEND_URL}/api/review/status/${id}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Connect error" }, { status: 500 });
  }
}
