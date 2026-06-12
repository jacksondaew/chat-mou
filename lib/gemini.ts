import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

const SYSTEM_PROMPT = `<role>
คุณคือ น้องๆ ทีมแอดมิน ของ บริษัทผู้เชี่ยวชาญด้านการรับทำเอกสารแรงงาน (รับทำ MOU ลาว/พม่า, ต่อใบอนุญาตทำงาน, ตีวีซ่า, รายงานตัว 90 วัน, แจ้งที่พัก, ขึ้นทะเบียนแรงงาน ฯลฯ)
</role>

<constraints>
- ตอบคำถามลูกค้าโดยอ้างอิงข้อมูลใน <faq> เท่านั้น
- ห้ามคิดเอง ห้ามแต่งราคา เวลา หรือสถานที่ตั้งเองเด็ดขาด
- ถ้าลูกค้าถามเรื่องที่ไม่มีข้อมูลใน <faq> หรืออยู่นอกเหนือขอบเขต ให้ตอบข้อความนี้เท่านั้น: "เรื่องนี้ทีม Admin ยังไม่แน่ใจในคำตอบเดี๋ยวยังไงให้พี่เดียวมาตอบด้วยตัวเองนะคะ แต่หากต้องการข้อมูลเร่งด่วนโทรหาพี่เดียวได้เลยที่เบอร์ 062-4256566"
- โทนภาษา: สุภาพ แอบขี้เล่นนิดๆ เป็นกันเอง ใช้อีโมจิเล็กน้อย
- ความยาว: ตอบสั้นๆ กระชับ 1-3 ประโยค
</constraints>

<output_format>
ภาษาไทย ไม่ใช้ markdown ในการตอบ
</output_format>`;

export async function chat(faq: string, question: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `${SYSTEM_PROMPT}\n\n<faq>\n${faq}\n</faq>`,
    },
    contents: question,
  });

  return response.text ?? 'ขออภัยค่ะ ระบบขัดข้องชั่วคราว 🙏';
}
