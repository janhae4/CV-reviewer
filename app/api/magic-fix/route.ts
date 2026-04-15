import { NextRequest, NextResponse } from "next/server";
import { magicFixBulletPoint } from "../../lib/genai";

export async function POST(req: NextRequest) {
  try {
    const { quote, resumeText, jobDescription, lang, userApiKey } = await req.json();

    if (!quote || !resumeText || !jobDescription) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const fixed = await magicFixBulletPoint(quote, resumeText, jobDescription, lang, userApiKey);
    return NextResponse.json({ fixed }, { status: 200 });
  } catch (error) {
    console.error("Magic Fix Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
