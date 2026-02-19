
import { GoogleGenAI, Type } from "@google/genai";
import { Exercise } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseWorkoutDescription = async (text: string): Promise<Partial<Exercise>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse this workout description: "${text}". 
      Return a JSON array of objects.
      If the input is in Japanese, the exercise names should remain in Japanese, but the "targetMuscles" MUST be translated to one or more of these standard English categories: "Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Full Body".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the exercise" },
              reps: { type: Type.NUMBER, description: "Number of repetitions" },
              sets: { type: Type.NUMBER, description: "Number of sets" },
              targetMuscles: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of target muscle groups (English categories only)"
              },
            },
            required: ["name", "reps", "sets", "targetMuscles"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("Error parsing workout:", error);
    throw error;
  }
};
