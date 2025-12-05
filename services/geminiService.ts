
import { GoogleGenAI, Type, Schema, Chat, Content } from "@google/genai";
import { AnalysisResult, MeatType, SafetyStatus, SensoryData, AIPersona } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meatType: {
      type: Type.STRING,
      enum: ["Thịt Heo", "Thịt Bò", "Thịt Gà", "Không xác định"],
      description: "Detect the type of raw meat.",
    },
    freshnessScore: {
      type: Type.NUMBER,
      description: "Score from 0 to 100 (0=Rotten, 100=Just slaughtered).",
    },
    freshnessLevel: {
      type: Type.INTEGER,
      description: "Strict 5-level grading: 1='Tươi rói', 2='Tươi', 3='Kém tươi', 4='Có nguy cơ', 5='Hư hỏng'.",
    },
    safetyStatus: {
      type: Type.STRING,
      enum: ["Tươi Ngon", "Cần Lưu Ý", "Hư Hỏng", "Không rõ"],
      description: "Final safety verdict.",
    },
    visualCues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List 4 specific observations in Vietnamese: Color, Fat, Texture, Moisture.",
    },
    summary: {
      type: Type.STRING,
      description: "Expert advice in Vietnamese. Be concise, empathetic, and actionable.",
    },
  },
  required: ["meatType", "freshnessScore", "freshnessLevel", "safetyStatus", "visualCues", "summary"],
};

export const analyzeMeatImage = async (base64Image: string, useProModel: boolean = false): Promise<AnalysisResult> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Select model based on Pro mode
    // Basic: gemini-2.5-flash
    // Advanced/Premium: gemini-3-pro-preview
    const modelName = useProModel ? "gemini-3-pro-preview" : "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Bạn là một chuyên gia AI về Công nghệ Thực phẩm (FoodTech). 
            Phân tích hình ảnh thịt sống để xác định chất lượng.
            
            QUY ĐỊNH CẤP ĐỘ (Level 1-5):
            1. Tươi rói (Premium/Excellent): Màu sắc hoàn hảo, bề mặt khô ráo, đàn hồi tốt.
            2. Tươi (Good): Màu đẹp, đạt chuẩn để nấu ăn ngon.
            3. Kém tươi (Average): Bắt đầu oxy hóa nhẹ, màu sậm hơn, bề mặt hơi ướt.
            4. Có nguy cơ (Warning): Màu tái hoặc thâm, chảy dịch nhớt, có mùi nhẹ.
            5. Hư hỏng (Danger): Thối rữa, xanh đen, nhớt, nguy hiểm.

            Phân tích kỹ các dấu hiệu sinh hóa:
            - Heo: Hồng nhạt (tươi) vs Xám/Nâu (ôi).
            - Bò: Đỏ cherry (tươi) vs Nâu đen (oxy hóa).
            - Gà: Hồng/Trắng ngà (tươi) vs Vàng nhớt/Xám (hỏng).

            Cảnh báo gian lận: Nếu thịt quá đỏ (hóa chất) hoặc quá bóng nước (bơm nước) -> Level 4 hoặc 5.
            
            Trả về JSON theo schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: useProModel ? 0.2 : 0.4, // Pro model implies more precision
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    console.log("data: ", text)
    return {
      ...data,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      meatType: MeatType.UNKNOWN,
      freshnessScore: 0,
      freshnessLevel: 5,
      safetyStatus: SafetyStatus.UNKNOWN,
      visualCues: ["Lỗi hệ thống", "Không thể phân tích"],
      summary: "Vui lòng thử lại với hình ảnh rõ nét hơn.",
      timestamp: Date.now(),
    };
  }
};

export const refineAnalysis = async (initialResult: AnalysisResult, sensoryData: SensoryData, useProModel: boolean = false): Promise<AnalysisResult> => {
  try {
    const modelName = useProModel ? "gemini-3-pro-preview" : "gemini-2.5-flash";

    const prompt = `
      Bạn là chuyên gia An toàn Thực phẩm.
      
      1. KẾT QUẢ PHÂN TÍCH HÌNH ẢNH TRƯỚC ĐÓ:
      - Loại thịt: ${initialResult.meatType}
      - Điểm hình ảnh: ${initialResult.freshnessScore}
      - Level hình ảnh: ${initialResult.freshnessLevel}
      
      2. NGƯỜI DÙNG CUNG CẤP THÊM DỮ LIỆU CẢM QUAN (Thang điểm 0-100, càng cao càng tệ):
      - Mùi (Smell): ${sensoryData.smell}/100 (Cao = Hôi/Thối)
      - Kết cấu (Texture): ${sensoryData.texture}/100 (Cao = Nhão/Nát/Không đàn hồi)
      - Độ nhớt (Sliminess): ${sensoryData.moisture}/100 (Cao = Nhớt dính tay)
      - Dịch tiết (Drip Loss): ${sensoryData.drip}/100 (Cao = Chảy nước đục)

      3. NHIỆM VỤ:
      Kết hợp dữ liệu hình ảnh và dữ liệu cảm quan để đưa ra KẾT LUẬN CUỐI CÙNG.
      
      QUY TẮC QUAN TRỌNG:
      - Dữ liệu cảm quan (Mùi và Độ nhớt) QUAN TRỌNG HƠN hình ảnh.
      - Nếu Mùi > 60 (Hôi) hoặc Độ nhớt > 60 (Nhớt), BẮT BUỘC đánh giá là Level 4 hoặc 5 (Hư hỏng), bất kể hình ảnh đẹp thế nào (vì có thể hình ảnh bị lừa hoặc mới hỏng chưa đổi màu).
      - Nếu cảm quan tốt (điểm thấp) nhưng hình ảnh xấu, hãy cân nhắc điểm trung bình nhưng cảnh báo người dùng.
      
      Hãy trả về JSON theo schema cũ, nhưng cập nhật visualCues để phản ánh cả input của người dùng (ví dụ: "Mùi hôi nồng được xác nhận").
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: useProModel ? 0.2 : 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    
    return {
      ...data,
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error("Refine Error:", error);
    return initialResult; // Fallback to original result if error
  }
};

export const createChatSession = (persona: AIPersona, location?: {lat: number, lng: number}, history?: Content[]): Chat => {
  let systemInstruction = "";
  // Enable Google Maps tool for Housewife to find markets
  const tools = persona === AIPersona.HOUSEWIFE ? [{googleMaps: {}}] : [];
  const toolConfig = location && persona === AIPersona.HOUSEWIFE ? {
      retrievalConfig: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng
        }
      }
  } : undefined;

  switch (persona) {
    case AIPersona.CHEF:
      systemInstruction = "Bạn là Chef Gordon Ramsay phiên bản Việt. Bạn chuyên về kỹ thuật nấu ăn, lên thực đơn và am hiểu sâu sắc về ẩm thực. Phong cách: Chuyên nghiệp, khắt khe nhưng tận tâm, dùng từ ngữ chuyên ngành ẩm thực (Sous-vide, Deglaze, Sear...). Nhiệm vụ: Gợi ý thực đơn 3 miền, Âu/Á dựa trên nguyên liệu người dùng có, hướng dẫn các bước nấu chi tiết (thời gian, nhiệt độ), mẹo sơ chế khử mùi.";
      break;
    case AIPersona.HOUSEWIFE:
      systemInstruction = "Bạn là Chị Ba Nội Trợ, một người phụ nữ đảm đang, tiết kiệm và khéo léo. Phong cách: Thân thiện, gần gũi (xưng Chị - Em), thực tế. Nhiệm vụ: Chỉ cách chọn đồ ngon ở chợ, gợi ý địa điểm chợ/siêu thị gần người dùng (sử dụng Google Maps nếu cần), cách trả giá, và các mẹo vặt bảo quản thực phẩm lâu hư, tiết kiệm chi phí.";
      break;
    case AIPersona.FRIEND:
      systemInstruction = "Bạn là một Foodie sành điệu, bạn thân của người dùng. Bạn biết các quán ăn ngon, bắt trend nhanh (Hotpot Manwah, Haidilao, trà sữa...) và luôn vui vẻ. Phong cách: Trẻ trung, dùng teencode vừa phải, hài hước, xưng hô Tui - Bạn/Bà/Ông. Nhiệm vụ: Trò chuyện vui vẻ về đồ ăn, kể chuyện cười về ăn uống, review món ăn, chia sẻ niềm vui ăn uống.";
      break;
  }

  return ai.chats.create({
    model: "gemini-2.5-flash",
    history: history,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      tools: tools,
      toolConfig: toolConfig
    },
  });
};
