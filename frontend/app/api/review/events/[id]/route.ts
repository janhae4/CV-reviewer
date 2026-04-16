import { NextRequest } from "next/server";

import { getBackendUrl } from "@/lib/config";

const BACKEND_URL = getBackendUrl();


export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const response = await fetch(`${BACKEND_URL}/api/review/events/${id}`, {
    headers: {
      'Accept': 'text/event-stream',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`[SSE Proxy] Backend error: ${response.status} ${response.statusText}`);
    return new Response(`Backend error: ${response.status}`, { status: response.status });
  }

  if (!response.body) {
    return new Response('No response body from backend', { status: 502 });
  }

  // Create a TransformStream to pass through the events
  const { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
