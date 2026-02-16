import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (aiClient) return aiClient;

  let apiKey = '';

  // 1. Try import.meta.env (Vite / Modern Browsers) - Priority for client-side
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY || '';
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Try process.env (Node.js / Webpack) - Fallback
  if (!apiKey) {
    try {
      // Check for process existence safely before accessing env
      // @ts-ignore
      if (typeof process !== 'undefined' && process?.env) {
        // @ts-ignore
        apiKey = process.env.API_KEY || '';
      }
    } catch (e) {
      // Ignore ReferenceError
    }
  }

  // Log warning but don't crash the app initialization
  if (!apiKey) {
    console.warn("BoardExamDost: API Key is missing. Chat features will not work until API_KEY or VITE_API_KEY is set.");
  }

  // Initialize with a placeholder if missing to prevent crash, 
  // but actual calls will fail gracefully in the UI
  aiClient = new GoogleGenAI({
    apiKey: apiKey || 'MISSING_KEY_PLACEHOLDER',
    vertexai: true
  });
  
  return aiClient;
};

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string
) => {
  try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 500,
        // Enable Google Search tool for grounding
        tools: [{ googleSearch: {} }],
      },
      history: history,
    });

    const result = await chat.sendMessageStream({
      message: newMessage,
    });

    return result;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    // Re-throw with a user-friendly message if it's an API key issue
    if (error instanceof Error && (error.message.includes('API key') || error.message.includes('403') || error.message.includes('401'))) {
      throw new Error("Authentication failed. Please check if the API Key is configured correctly.");
    }
    throw error;
  }
};
