import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    // 1. Verify user token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    // 2. Parse request body (mock result data)
    const { resultsData } = await request.json();

    if (!resultsData) {
      return NextResponse.json({ error: "Missing result data" }, { status: 400 });
    }

    // 3. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // 4. Construct Prompt
    const prompt = `
      You are an expert exam preparation tutor. Analyze the following student performance data from a mock test and generate a concise, actionable study plan.
      
      Student Performance:
      Score: ${resultsData.score} / ${resultsData.totalMarks} (${resultsData.percentage}%)
      Correct: ${resultsData.correctAnswers}, Incorrect: ${resultsData.incorrectAnswers}, Skipped: ${resultsData.skippedAnswers}
      Topic Analysis: ${JSON.stringify(resultsData.topicAnalysis)}
      
      Please provide your response in the following structured JSON format only, with no markdown code blocks outside of the JSON structure itself, just pure JSON:
      {
        "overallAssessment": "A 2-3 sentence summary of their performance.",
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"],
        "studyPlan": [
          { "day": "Day 1", "focus": "Topic name", "action": "Specific study action" },
          { "day": "Day 2", "focus": "Topic name", "action": "Specific study action" },
          { "day": "Day 3", "focus": "Topic name", "action": "Specific study action" }
        ],
        "tips": ["Tip 1", "Tip 2", "Tip 3"]
      }
    `;

    // 5. Generate Content
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const text = response.text;
    
    // 6. Clean JSON parsing
    let parsedData;
    try {
      // Remove any markdown code block wrappers if they exist
      const cleanText = (text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse Gemini output as JSON", text);
      return NextResponse.json({ error: "AI response formatting error" }, { status: 500 });
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI analysis", details: error.message },
      { status: 500 }
    );
  }
}
