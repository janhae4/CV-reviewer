import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "../../lib/genai";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, lang, userApiKey } = await req.json();
    
    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const coverLetter = await generateCoverLetter(resumeText, jobDescription, lang, userApiKey);
    return NextResponse.json({ coverLetter }, { status: 200 });
  } catch (error) {
    console.error("Cover Letter API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
