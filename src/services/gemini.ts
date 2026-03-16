import { GoogleGenAI, Type } from "@google/genai";
import { NodeId, Scenario, Feedback, QuizQuestion } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `
Eres un Tutor Interactivo Experto en Trazabilidad y Normatividad Láctea. Tu objetivo es guiar al usuario a través de una aplicación dinámica de aprendizaje basada exclusivamente en el Decreto 616 de 2006, el Manual de Análisis de Calidad y la Cartilla de Buenas Prácticas de Ordeño (BPO).

Estructura de la Aplicación:
1. Finca (Producción Primaria): Rutinas de ordeño, higiene del personal y sanidad animal.
2. Transporte y Acopio: Cadena de frío, vehículos isotérmicos y pruebas de plataforma.
3. Planta de Procesamiento: Higienización (Pasteurización, UHT), análisis de laboratorio y almacenamiento.
4. Consumo y Mesa: Rotulado, vida útil y clasificación de leches.

Reglas:
- Genera escenarios con 3 opciones (al menos una incorrecta).
- Proporciona retroalimentación con fundamentos normativos (ej. Art. 10 Decreto 616).
- Explica riesgos de contaminación (primaria, directa o cruzada) en opciones incorrectas.
- Usa un tono profesional, educativo y emojis.
- Conocimiento técnico: Prueba de alcohol (78% v/v para UHT), densidad (1.030-1.033 g/ml), pH (6.5-6.7), Pasteurización (72-76°C por 15s), UHT (135-150°C por 2s).
`;

export async function generateScenario(nodeId: NodeId): Promise<Scenario> {
  const model = "gemini-3.1-pro-preview";
  const prompt = `Genera un escenario de aprendizaje para el nodo: ${nodeId}. 
  Debe incluir un título, una descripción del escenario y 3 opciones de acción. 
  Al menos una opción debe ser incorrecta según la normativa.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN }
              },
              required: ["id", "text", "isCorrect"]
            }
          }
        },
        required: ["title", "description", "options"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return { ...data, nodeId, id: Math.random().toString(36).substr(2, 9) };
}

export async function getFeedback(scenario: Scenario, selectedOptionId: string): Promise<Feedback> {
  const model = "gemini-3.1-pro-preview";
  const selectedOption = scenario.options.find(o => o.id === selectedOptionId);
  const prompt = `El usuario seleccionó la opción: "${selectedOption?.text}" en el escenario: "${scenario.title}".
  Proporciona retroalimentación detallada basada en el Decreto 616 de 2006 y las fuentes técnicas.
  Si es correcto, cita el fundamento normativo.
  Si es incorrecto, explica el riesgo de contaminación y da la información correcta.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          message: { type: Type.STRING },
          citation: { type: Type.STRING }
        },
        required: ["isCorrect", "message"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateQuiz(nodeId: NodeId): Promise<QuizQuestion> {
  const model = "gemini-3.1-pro-preview";
  const prompt = `Genera una pregunta de evaluación de selección múltiple para el nodo: ${nodeId}. 
  Debe tener 4 opciones y una explicación detallada de la respuesta correcta basada en la norma.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return { ...data, id: Math.random().toString(36).substr(2, 9) };
}
