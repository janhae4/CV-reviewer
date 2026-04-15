import { GoogleGenAI } from "@google/genai";

console.log("process.env.GEMINI_API_KEY", process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const reviewResume = async (
  resumeText: string,
  jobDescription: string,
  lang: string = "vi",
  providedApiKey?: string
) => {
  const isEn = lang === "en";
  const languageName = isEn ? "English" : "Tiếng Việt";

  // If user provides their own key, use it; otherwise fallback to system key
  const aiClient = (providedApiKey && providedApiKey !== "DEV_BYPASS")
    ? new GoogleGenAI({ apiKey: providedApiKey }) 
    : ai;

  const response = await aiClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là một chuyên gia ATS resume reviewer.

Hãy phân tích CV dưới đây, so sánh với JD nếu không có thì ko cần trả về keywords, cvKeywords, missingKeywords.
Trả lời bằng ${languageName} với định dạng JSON THUẦN TÚY (không có markdown, không có \`\`\`), KHÔNG giải thích thêm, theo mẫu:
{
  "general": "<Nhận xét tổng quan>",
  "rate": "<x/10>",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": ["...", "..."],
  "keywords": ["..."],
  "cvKeywords": ["..."],
  "missingKeywords": ["..."],
  "annotations": [
    {
      "quote": "<đoạn văn bản CHÍNH XÁC từng chữ từ CV, ngắn 4-10 từ, không thêm/bỏ ký tự nào>",
      "suggestion": "<gợi ý cụ thể cần cải thiện đoạn đó>",
      "type": "error"
    }
  ]
}

Quy tắc cho "annotations":
- Chỉ 3-4 annotation
- "quote" PHẢI là chuỗi con xuất hiện CHÍNH XÁC trong CV bên dưới (copy paste nguyên văn, không chỉnh)
- Ưu tiên trích dẫn tên section, tên công ty, skill keywords hoặc câu mở đầu của từng mục
- "type": "error" = cần sửa gấp, "warning" = nên cải thiện, "ok" = điểm mạnh

# JD:
${jobDescription || "(Không có JD)"}

# CV:
${resumeText}
`,
    config: {
      systemInstruction: `Bạn là một chuyên gia ATS resume reviewer. Chỉ trả về JSON thuần túy, không có markdown code block.`,
    },
  });
  const text = response.text || "";
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json?\n?/gi, "").replace(/```/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  const jsonString = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("JSON parse error:", error, jsonString);
    return { error: "AI did not return valid JSON." };
  }
};
