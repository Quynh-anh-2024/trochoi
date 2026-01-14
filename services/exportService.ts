import { GameIdea } from "../types";
import PptxGenJS from "pptxgenjs";

// --- HTML Export ---
export const exportToHTML = (idea: GameIdea) => {
  const content = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${idea.title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
        h1 { color: #1e40af; margin-bottom: 10px; }
        .meta { display: flex; justify-content: center; gap: 20px; color: #666; font-weight: bold; }
        .section { background: #fff; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        h2 { color: #d97706; border-left: 5px solid #d97706; padding-left: 10px; }
        .tag { display: inline-block; background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; font-weight: bold; }
        .question-box { background: #f9fafb; padding: 15px; margin-bottom: 10px; border-left: 4px solid #10b981; }
        .answer { color: #059669; font-weight: bold; margin-top: 5px; }
        ul, ol { padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${idea.title}</h1>
        <div class="meta">
          <span>⏱ ${idea.duration}</span>
          <span>😊 ${idea.funFactor}</span>
        </div>
        <p style="font-style: italic; margin-top: 15px;">"${idea.description}"</p>
      </div>

      <div class="section">
        <h2>🎯 Mục tiêu bài học</h2>
        <p>${idea.learningGoal}</p>
      </div>

      <div class="section">
        <h2>🎒 Chuẩn bị</h2>
        <ul>
          ${idea.preparation.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>📝 Cách tổ chức</h2>
        <ol>
          ${idea.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>

      <div class="section">
        <h2>🏆 Điểm thưởng & Luật chơi</h2>
        <ul>
          <li><strong>Cơ chế:</strong> ${idea.rewardDetails.mechanic}</li>
          <li><strong>Danh hiệu:</strong> ${idea.rewardDetails.badges}</li>
          <li><strong>Khi sai:</strong> ${idea.rewardDetails.feedback}</li>
        </ul>
      </div>

      <div class="section">
        <h2>❓ Ngân hàng câu hỏi</h2>
        ${idea.quizExamples.map((q, i) => `
          <div class="question-box">
            <div><span class="tag">${q.type}</span> <strong>Câu ${i + 1}:</strong> ${q.question}</div>
            <div class="answer">Đáp án: ${q.answer}</div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${idea.title}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --- PPTX Export ---
export const exportToPPTX = async (idea: GameIdea) => {
  const pres = new PptxGenJS();
  
  // Resolve shape types safely (handling different version/bundler structures)
  // @ts-ignore
  const shapeRect = pres.ShapeType?.rect || pres.shapes?.RECTANGLE;
  // @ts-ignore
  const shapeOval = pres.ShapeType?.oval || pres.shapes?.OVAL;

  if (!shapeRect || !shapeOval) {
    console.warn("Could not find shape definitions in PptxGenJS instance");
  }
  
  // Slide Master settings
  pres.layout = 'LAYOUT_16x9';

  // Define colors
  const blue = "3B82F6";
  const yellow = "F59E0B";
  const gray = "374151";
  const white = "FFFFFF";

  // 1. Title Slide
  let slide = pres.addSlide();
  slide.background = { color: "F0F9FF" };
  slide.addText("HOẠT ĐỘNG KHỞI ĐỘNG", { x: 0.5, y: 0.5, w: "90%", fontSize: 14, color: blue, bold: true });
  slide.addText(idea.title, { x: 0.5, y: 1.5, w: "90%", fontSize: 44, color: gray, bold: true });
  slide.addText(`"${idea.description}"`, { x: 0.5, y: 3.0, w: "90%", fontSize: 18, color: "6B7280", italic: true });
  
  // Info bubbles
  if (shapeRect) {
    slide.addShape(shapeRect, { x: 0.5, y: 4.5, w: 3, h: 1, fill: { color: white }, line: { color: blue, width: 2 }, rectRadius: 0.2 });
  }
  slide.addText("Thời gian", { x: 0.7, y: 4.7, fontSize: 12, color: "9CA3AF", bold: true });
  slide.addText(idea.duration, { x: 0.7, y: 5.1, fontSize: 18, color: blue, bold: true });

  if (shapeRect) {
    slide.addShape(shapeRect, { x: 4, y: 4.5, w: 3, h: 1, fill: { color: white }, line: { color: yellow, width: 2 }, rectRadius: 0.2 });
  }
  slide.addText("Độ vui", { x: 4.2, y: 4.7, fontSize: 12, color: "9CA3AF", bold: true });
  slide.addText(idea.funFactor, { x: 4.2, y: 5.1, fontSize: 18, color: yellow, bold: true });

  // 2. Preparation & Goals
  slide = pres.addSlide();
  slide.addText("Chuẩn Bị & Mục Tiêu", { x: 0.5, y: 0.5, fontSize: 24, color: blue, bold: true });
  
  // Goals
  if (shapeRect) {
    slide.addShape(shapeRect, { x: 0.5, y: 1.2, w: 4.5, h: 4, fill: { color: "ECFDF5" }, rectRadius: 0.2 }); // Greenish bg
  }
  slide.addText("Mục Tiêu Bài Học", { x: 0.7, y: 1.5, fontSize: 16, color: "047857", bold: true });
  slide.addText(idea.learningGoal, { x: 0.7, y: 2.0, w: 4, fontSize: 14, color: gray });

  // Prep
  if (shapeRect) {
    slide.addShape(shapeRect, { x: 5.5, y: 1.2, w: 4.5, h: 4, fill: { color: "F5F3FF" }, rectRadius: 0.2 }); // Purpleish bg
  }
  slide.addText("Dụng Cụ Cần Thiết", { x: 5.7, y: 1.5, fontSize: 16, color: "6D28D9", bold: true });
  
  let prepY = 2.0;
  idea.preparation.forEach(p => {
    slide.addText(`• ${p}`, { x: 5.7, y: prepY, w: 4, fontSize: 14, color: gray });
    prepY += 0.4;
  });

  // 3. Rules / Steps
  slide = pres.addSlide();
  slide.addText("Cách Tổ Chức", { x: 0.5, y: 0.5, fontSize: 24, color: blue, bold: true });
  
  let stepY = 1.2;
  idea.steps.forEach((step, idx) => {
    // Number circle
    if (shapeOval) {
      slide.addShape(shapeOval, { x: 0.5, y: stepY, w: 0.4, h: 0.4, fill: { color: blue } });
    }
    slide.addText((idx + 1).toString(), { x: 0.5, y: stepY, w: 0.4, h: 0.4, align: "center", fontSize: 12, color: white, bold: true });
    
    // Text
    slide.addText(step, { x: 1.1, y: stepY, w: 8.5, fontSize: 14, color: gray });
    stepY += 0.8;
  });

  // 4. Rewards
  slide = pres.addSlide();
  slide.addText("Luật Tính Điểm", { x: 0.5, y: 0.5, fontSize: 24, color: yellow, bold: true });
  
  slide.addText("Cơ chế điểm:", { x: 0.5, y: 1.5, fontSize: 16, color: gray, bold: true });
  slide.addText(idea.rewardDetails.mechanic, { x: 0.5, y: 2.0, w: 9, fontSize: 14, color: gray });

  slide.addText("Danh hiệu:", { x: 0.5, y: 3.0, fontSize: 16, color: gray, bold: true });
  slide.addText(idea.rewardDetails.badges, { x: 0.5, y: 3.5, w: 9, fontSize: 14, color: "D97706", bold: true });

  slide.addText("Khi sai thì sao?", { x: 0.5, y: 4.5, fontSize: 16, color: gray, bold: true });
  slide.addText(idea.rewardDetails.feedback, { x: 0.5, y: 5.0, w: 9, fontSize: 14, color: gray, italic: true });

  // 5. Questions Slides (1 slide per question for presentation flow)
  idea.quizExamples.forEach((q, idx) => {
    slide = pres.addSlide();
    slide.background = { color: "3B82F6" }; // Blue background for question

    slide.addText(`Câu hỏi ${idx + 1} - ${q.type}`, { x: 0.5, y: 0.5, fontSize: 14, color: "93C5FD", bold: true });
    slide.addText(q.question, { x: 1, y: 2, w: "80%", fontSize: 32, color: white, align: "center", bold: true });
    
    // Add answer on the same slide but small at bottom (or could be next slide, but let's keep it simple)
    slide.addText(`Đáp án: ${q.answer}`, { x: 1, y: 4.5, w: "80%", fontSize: 18, color: "FEF3C7", align: "center" });
  });

  // Save
  await pres.writeFile({ fileName: `${idea.title}.pptx` });
};
