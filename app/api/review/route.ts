import { NextRequest, NextResponse } from "next/server";
import { reviewResume } from "../../lib/genai";

const PdfParse = require("pdf-parse");
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobDescription = formData.get("jobDescription") as string;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = "";

    if (file.type === "application/pdf") {
      const data = await PdfParse(buffer);
      text = data.text;
    // } else if (
    //   file.type ===
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    // ) {
    //   const data = await mammoth.extractRawText({ buffer });
    //   text = data.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No text extracted from file" },
        { status: 400 }
      );
    }

    const feedback = await reviewResume(text, jobDescription);
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
