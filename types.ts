export enum GradeLevel {
  Grade1 = "Lớp 1",
  Grade2 = "Lớp 2",
  Grade3 = "Lớp 3",
  Grade4 = "Lớp 4",
  Grade5 = "Lớp 5",
}

export enum Subject {
  Math = "Toán",
  Vietnamese = "Tiếng Việt",
  Science = "Khoa học / Tự nhiên xã hội",
  English = "Tiếng Anh",
  HistoryGeo = "Lịch sử & Địa lý",
  MusicArt = "Âm nhạc / Mỹ thuật",
  Moral = "Đạo đức",
  Informatics = "Tin học",
  Technology = "Công nghệ",
  Other = "Hoạt động trải nghiệm",
}

export interface QuestionExample {
  type: string; // "Trắc nghiệm", "Điền từ", "Sắp xếp"
  question: string;
  answer: string;
  imageDescription?: string; // Visual description for AI generation
  imageUrl?: string; // Generated image URL
}

export interface RewardSystem {
  mechanic: string; // Cách tính điểm (cộng/trừ)
  badges: string;   // Huy hiệu hoặc phần thưởng ảo
  feedback: string; // Cách xử lý khi sai (gợi ý/trừ điểm)
}

export interface GameIdea {
  title: string;
  duration: string;
  description: string;
  preparation: string[];
  steps: string[];
  learningGoal: string;
  funFactor: string;
  rewardDetails: RewardSystem;
  quizExamples: QuestionExample[];
  illustration?: string; // Base64 string of the generated image
}

export interface FormData {
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  classSize: number;
}