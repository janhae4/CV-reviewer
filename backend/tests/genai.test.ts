import { sanitize, parseJsonFromAI, normalizeText } from "../lib/genai";

describe("GenAI Utils", () => {
  describe("sanitize", () => {
    it("should remove potentially dangerous characters", () => {
      const input = "<h1>Hello</h1> <script>alert(1)</script>";
      const sanitized = sanitize(input, 100);
      expect(sanitized).not.toContain("<h1>");
      expect(sanitized).not.toContain("<script>");
    });

    it("should respect the limit", () => {
      const input = "A".repeat(200);
      const sanitized = sanitize(input, 100);
      expect(sanitized.length).toBe(100);
    });
  });

  describe("normalizeText", () => {
    it("should remove special characters and lowercase", () => {
      const input = "Hello, World! @ 2024 - Tiếng Việt";
      const normalized = normalizeText(input);
      expect(normalized).toBe("hello world 2024 tiếng việt");
    });

    it("should collapse whitespace", () => {
      const input = "  multi   space  \n content  ";
      const normalized = normalizeText(input);
      expect(normalized).toBe("multi space content");
    });
  });

  describe("parseJsonFromAI", () => {
    it("should parse valid JSON inside markdown blocks", () => {
      const input = 'Here is the result: ```json\n{"score": 8}\n``` end';
      const result = parseJsonFromAI(input, { score: 0 });
      expect(result.score).toBe(8);
    });

    it("should return default value on invalid JSON", () => {
      const input = "invalid content";
      const result = parseJsonFromAI(input, { default: true });
      expect(result.default).toBe(true);
    });

    it("should handle array responses", () => {
      const input = "```json\n[1, 2, 3]\n```";
      const result = parseJsonFromAI(input, []);
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
