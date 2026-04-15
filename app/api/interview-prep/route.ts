import { NextRequest, NextResponse } from "next/server";
import { generateInterviewPrep } from "../../lib/genai";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, lang, userApiKey } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Context missing" }, { status: 400 });
    }

    const prep = await generateInterviewPrep(resumeText, jobDescription, lang, userApiKey);
    return NextResponse.json({ prep }, { status: 200 });
  } catch (error) {
    console.error("Interview Prep Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
