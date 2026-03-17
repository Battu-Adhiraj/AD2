import { GoogleGenAI, Type } from "@google/genai";
import { UserMetrics, HealthResults } from "../utils/calculations";

export interface AIReport {
  coaching: string;
  predictions: string[];
  guidelines: string[];
  motivation: string;
  consultationAdvice: string[];
}

export async function generateAIReport(metrics: UserMetrics, results: HealthResults): Promise<AIReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Analyze the following health data and provide a comprehensive report.
  
  Subject Profile:
  - Age: ${metrics.age}
  - Gender: ${metrics.gender}
  - Weight: ${metrics.weight}kg
  - Height: ${metrics.height}cm
  - Activity Level: ${metrics.activityLevel}
  - Phenotype: ${metrics.phenotype}
  
  Calculated Biomarkers:
  - Body Fat: ${results.bodyFatPercentage.toFixed(1)}%
  - FFMI (Fat-Free Mass Index): ${results.ffmi.toFixed(1)}
  - WHtR (Waist-to-Height Ratio): ${results.whtr.toFixed(2)}
  - Metabolic Integrity Score: ${results.mis.toFixed(1)}/10
  - BMR: ${Math.round(results.bmr)} kcal
  - TDEE: ${Math.round(results.tdee)} kcal
  - Protein Target: ${Math.round(results.proteinTarget)}g
  - Risk Flags: ${results.riskFlags.length > 0 ? results.riskFlags.join(', ') : 'None'}
  
  Provide the response in JSON format matching the requested schema. Ensure the tone is professional, empathetic, and scientifically grounded.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert clinical health coach and medical AI assistant. Provide actionable, safe, and highly personalized advice. Use praise for good metrics, and stern but constructive nudging for poor metrics. Always include a disclaimer that this is not medical advice.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coaching: { type: Type.STRING, description: "Actionable health coaching advice based on the biomarkers." },
          predictions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential disease predictions and risk assessment based on the data." },
          guidelines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "General precautionary guidelines for daily life." },
          motivation: { type: Type.STRING, description: "Praise for good metrics or stern nudging for areas needing improvement." },
          consultationAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific questions and topics the user should discuss with their doctor." }
        },
        required: ["coaching", "predictions", "guidelines", "motivation", "consultationAdvice"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate AI report");
  }

  return JSON.parse(response.text) as AIReport;
}
