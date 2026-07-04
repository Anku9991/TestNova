import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminAuth } from "@/lib/firebase/admin";
// @ts-ignore
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function POST(request: Request) {
  try {
    // 1. Verify admin token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    // 2. Parse request formData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = "";

    // 3. Extract text based on file format
    if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
      const data = await pdf(buffer);
      rawText = data.text;
    } else if (
      file.name.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "No text content found in document." }, { status: 400 });
    }

    // 4. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });

    // 5. Construct Prompts
    const prompt = `
      You are an expert exam preparation data parser. Your task is to extract competitive exam questions from the raw text upload and structure them into a valid JSON array of CBT questions.

      Analyze the following raw text content extracted from a document:
      ---
      ${rawText}
      ---

      Extract all questions and return a pure JSON array containing the structured data. Do not include markdown code block wrappers (like \`\`\`json) outside of the JSON structure itself, just return a valid JSON array matching this exact schema:

      [
        {
          "text": "The HTML formatted question text. Keep mathematical formulas or special expressions inside raw KaTeX/HTML format if applicable (e.g., use inline HTML tags like &lt;b&gt; or standard text).",
          "type": "single | multiple | true_false",
          "difficulty": "easy | medium | hard",
          "options": [
            { "id": "opt1", "text": "Option text 1", "isCorrect": true },
            { "id": "opt2", "text": "Option text 2", "isCorrect": false },
            { "id": "opt3", "text": "Option text 3", "isCorrect": false },
            { "id": "opt4", "text": "Option text 4", "isCorrect": false }
          ],
          "correctAnswer": "opt1",
          "explanation": "Detailed explanation HTML content",
          "marks": 2,
          "negativeMarks": 0.5
        }
      ]

      Rules:
      1. If options are not explicitly marked with letters (A, B, C, D), generate logical option IDs like opt1, opt2, opt3, opt4.
      2. Ensure HTML characters in JSON strings are properly escaped.
      3. Return ONLY a valid JSON array. If no questions can be extracted, return an empty array [].
    `;

    // 6. Generate Content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    // 7. Clean JSON parsing
    let parsedQuestions = [];
    try {
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedQuestions = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse Gemini output as JSON", text);
      return NextResponse.json(
        { error: "AI response formatting error. Please try again with a cleaner document." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedQuestions);
  } catch (error: any) {
    console.error("AI Importer error:", error);
    return NextResponse.json(
      { error: "Failed to parse questions", details: error.message },
      { status: 500 }
    );
  }
}
