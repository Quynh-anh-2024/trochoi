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
        description: "Các bước tổ chức",
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
            question: { type: Type.STRING, description: "Nội dung câu hỏi cụ thể liên quan đến chủ đề" },
            answer: { type: Type.STRING, description: "Đáp án đúng" },
            imageDescription: { type: Type.STRING, description: "Mô tả hình ảnh minh họa cho câu hỏi này để giúp học sinh dễ hiểu. VD: '3 quả cam', 'Hình tam giác màu đỏ'." }
          },
          required: ["type", "question", "answer", "imageDescription"]
        },
        description: "3 ví dụ câu hỏi cụ thể (1 trắc nghiệm, 1 điền từ, 1 sắp xếp) cho chủ đề này, kèm mô tả hình ảnh minh họa."
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

    Yêu cầu đặc biệt:
    1. **Thời gian:** Ngắn gọn, chỉ khoảng 3-5 phút.
    2. **Hệ thống thưởng (Gamification):** Thiết kế cơ chế tính điểm rõ ràng. Khi trả lời đúng được cộng điểm, trả lời sai có thể trừ điểm nhẹ hoặc đưa ra gợi ý. Đề xuất các danh hiệu/huy hiệu ngộ nghĩnh (Ví dụ: "Ong chăm chỉ", "Nhà thông thái") khi đạt mốc điểm.
    3. **Nội dung câu hỏi đa dạng và TRỰC QUAN:** Trong mỗi trò chơi, hãy đưa ra ví dụ cụ thể về 3 dạng câu hỏi liên quan trực tiếp đến chủ đề "${formData.topic}".
       - Rất quan trọng: Mỗi câu hỏi PHẢI có một mô tả hình ảnh (imageDescription) để minh họa cho nội dung đó. Ví dụ: Nếu hỏi "1 + 1 = ?", imageDescription nên là "Hình ảnh 1 chú thỏ cộng thêm 1 chú thỏ".
       - Dạng 1: Trắc nghiệm (Nhiều lựa chọn).
       - Dạng 2: Điền từ vào chỗ trống.
       - Dạng 3: Sắp xếp từ thành câu/Sắp xếp quy trình.
    4. Ngôn ngữ thân thiện, vui tươi, khích lệ học sinh tiểu học.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "Bạn là trợ lý giáo dục chuyên nghiệp, tập trung vào phương pháp Gamification (Trò chơi hóa) trong lớp học.",
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

  // Simple prompt for a kid-friendly illustration
  const prompt = `A cute, simple, colorful, 3D cartoon style sticker illustration suitable for elementary school education. 
  Subject: ${description || title}. 
  Style: Cheerful, bright colors, white background, high quality icon style. Single object or clear scene. No text in image.`;

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