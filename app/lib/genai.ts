import { GoogleGenAI } from "@google/genai";

console.log("process.env.GEMINI_API_KEY", process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const reviewResume = async (
  resumeText: string,
  jobDescription: string
) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Bạn là một chuyên gia ATS resume reviewer.

Hãy phân tích CV dưới đây, so sánh với JD nếu không có thì ko cần trả về keywords, cvKeywords, missingKeywords, trả lời bằng tiếng Việt với định dạng JSON, KHÔNG giải thích thêm, theo mẫu:
{
  "general": "<Nhận xét tổng quan>",
  "rate": "<Điểm ATS trên thang 10>",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": ["...", "..."],
  "keywords": ["...", "..."], // keywords quan trọng từ JD
  "cvKeywords": ["...", "..."], // keywords quan trọng tìm thấy trong CV
  "missingKeywords": ["...", "..."] // keyword JD còn thiếu trong CV
}

# JD:
${jobDescription}

# CV:
${resumeText}
`,
    config: {
      systemInstruction: `Bạn là một chuyên gia ATS resume reviewer.`,
    },
  });
  const text = response.text || "";
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const jsonString = text.substring(jsonStart, jsonEnd + 1);

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("JSON parse error:", error, jsonString);
    return { error: "AI did not return valid JSON." };
  }
};
