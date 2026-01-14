import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormData, GameIdea } from "../types";

// Validate API Key function
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Try to generate a very simple content to test the key
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};

const generateGameIdeas = async (formData: FormData, apiKey: string): Promise<GameIdea[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const gameIdeaSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Tên trò chơi sáng tạo" },
      duration: { type: Type.STRING, description: "Thời gian ước lượng (ví dụ: 3-5 phút)" },
      description: { type: Type.STRING, description: "Mô tả ngắn gọn" },
      preparation: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Dụng cụ cần chuẩn bị",
      },
      steps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Các bước tổ chức"
      },
      learningGoal: { type: Type.STRING, description: "Mục tiêu bài học" },
      funFactor: { type: Type.STRING, description: "Yếu tố vui nhộn" },
      rewardDetails: {
        type: Type.OBJECT,
        properties: {
          mechanic: { type: Type.STRING, description: "Luật cộng điểm khi đúng và trừ điểm/nhắc nhở khi sai" },
          badges: { type: Type.STRING, description: "Các danh hiệu/huy hiệu ngộ nghĩnh (Ví dụ: 'Thần đồng toán học')" },
          feedback: { type: Type.STRING, description: "Cách đưa ra gợi ý khi học sinh trả lời sai để khích lệ" }
        },
        required: ["mechanic", "badges", "feedback"]
      },
      quizExamples: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "Loại câu hỏi: 'Trắc nghiệm', 'Điền từ', hoặc 'Sắp xếp câu'" },
            question: { type: Type.STRING, description: "Nội dung câu hỏi. LƯU Ý: Câu hỏi này đóng vai trò là GỢI Ý để mở mảnh ghép hình ảnh." },
            answer: { type: Type.STRING, description: "Đáp án đúng" },
            imageDescription: { type: Type.STRING, description: "Mô tả chi tiết hình ảnh minh họa cho riêng câu hỏi này (nếu cần)." }
          },
          required: ["type", "question", "answer", "imageDescription"]
        },
        description: "4 ví dụ câu hỏi cụ thể. Các câu hỏi này sẽ tương ứng với 4 mảnh ghép che đi bức tranh chủ đề."
      }
    },
    required: ["title", "duration", "description", "preparation", "steps", "learningGoal", "funFactor", "rewardDetails", "quizExamples"],
  };

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: gameIdeaSchema,
  };

  const prompt = `
    Đóng vai chuyên gia giáo dục tiểu học. Hãy thiết kế 3 trò chơi học tập khởi động cho:
    - Khối: ${formData.grade}
    - Môn: ${formData.subject}
    - Chủ đề: ${formData.topic}
    - Sĩ số: ${formData.classSize}

    Yêu cầu đặc biệt về thiết kế trò chơi "LẬT MẢNH GHÉP" (Puzzle Reveal):
    1. **Hình ảnh chủ đề:** Hãy hình dung một hình ảnh "Key Visual" đại diện cho chủ đề "${formData.topic}".
    2. **Câu hỏi mảnh ghép:** Tạo ra 4 câu hỏi (quizExamples). Mỗi câu hỏi khi trả lời đúng sẽ mở ra một góc của hình ảnh chủ đề đó.
       - Nội dung câu hỏi phải liên quan mật thiết đến kiến thức của chủ đề.
       - Dạng câu hỏi đa dạng: Trắc nghiệm, Điền từ, Đố vui.
    3. **Gamification:** Thiết kế luật chơi sao cho cả lớp cùng tham gia đoán hình ảnh bí mật phía sau các mảnh ghép.
    4. **Hình minh họa:** Trong trường 'imageDescription' của từng câu hỏi, hãy mô tả gợi ý hình ảnh liên quan đến câu hỏi đó. 
    
    Yêu cầu chung:
    - Thời gian: 3-5 phút.
    - Ngôn ngữ: Tiếng Việt, giọng văn vui tươi, khích lệ.
    - Trả về JSON theo schema đã định nghĩa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "Bạn là trợ lý giáo dục chuyên nghiệp, chuyên thiết kế các trò chơi tương tác trực quan cho học sinh tiểu học.",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as GameIdea[];
  } catch (error) {
    console.error("Error generating game ideas:", error);
    throw error;
  }
};

const generateGameIllustration = async (title: string, description: string, apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  // Enhanced prompt to act as a dynamic image library generator
  const prompt = `
    Create a high-quality educational illustration suitable for elementary school students (ages 6-10).
    Topic: ${title} - ${description}
    Style: 3D vector art style, colorful, cheerful, clean white background. 
    Make it look like a premium sticker or educational flashcard asset.
    Ensure specific details from the description (like numbers, objects, colors) are accurate.
    No text inside the image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.warn("Failed to generate illustration:", error);
    return null;
  }
};

export { generateGameIdeas, generateGameIllustration };