
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Transaction } from "../types";

export const getAIInsights = async (
  students: Student[],
  transactions: Transaction[]
) => {
  // Initialize AI client inside the function to ensure it always uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    أنت مستشار تعليمي/إداري متخصص لـ "Ahela Store".
    قم بتحليل هذه البيانات:
    - عدد الطلاب الإجمالي: ${students.length}
    - الحالات المعفية: ${students.filter(s => s.isExempted).length}
    - إجمالي الامتحانات المسجلة: ${students.reduce((acc, s) => acc + s.grades.length, 0)}
    - صافي الربح الحالي: ${transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)} ج.م

    بناءً على أن Ahela Store هو القائم على العمل، قدم:
    1. تحليل للوضع الحالي وكيفية إدارة العمل.
    2. 3 نصائح لتحسين الأداء (سواء تعليمي أو تجاري).
    3. 3 نصائح مالية لزيادة كفاءة المتجر/السنتر.
    
    الرد يجب أن يكون بتنسيق JSON حصراً.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and business analysis tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentStatus: { type: Type.STRING },
            financialTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            educationalTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['currentStatus', 'financialTips', 'educationalTips']
        }
      }
    });

    // Access the text property directly (not a method) and trim whitespace
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
        currentStatus: "خطأ في الاتصال بالذكاء الاصطناعي.",
        financialTips: [],
        educationalTips: []
    };
  }
};
