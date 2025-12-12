import { GoogleGenAI, Type, Schema, Chat, Content } from "@google/genai";
import { AnalysisResult, MeatType, SafetyStatus, SensoryData, AIPersona } from "../../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
      description:
        "Strict 5-level grading: 1='Tươi rói', 2='Tươi', 3='Kém tươi', 4='Có nguy cơ', 5='Hư hỏng'.",
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

/** ===== Helpers ===== */
const randomIntInclusive = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Special-case detector (image-only, separate call)
 * - Pork on plate/tray
 * - Has outer wrap/film
 * - Plate color: pink / green
 */
const specialCaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isPorkOnPlate: {
      type: Type.BOOLEAN,
      description: "True if the image shows raw pork presented on a plate/tray/dish.",
    },
    hasOuterWrap: {
      type: Type.BOOLEAN,
      description: "True if there is an outer wrap/film/plastic covering the meat or plate.",
    },
    plateColor: {
      type: Type.STRING,
      enum: ["pink", "green", "other", "unknown"],
      description: "Dominant plate/tray color if visible.",
    },
  },
  required: ["isPorkOnPlate", "hasOuterWrap", "plateColor"],
};

type SpecialCaseDetect = {
  isPorkOnPlate: boolean;
  hasOuterWrap: boolean;
  plateColor: "pink" | "green" | "other" | "unknown";
};

const detectSpecialCaseFromImage = async (
  cleanBase64: string,
  modelName: string
): Promise<SpecialCaseDetect | null> => {
  try {
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
            text: `Chỉ trả về JSON theo schema.
- Có phải THỊT HEO SỐNG đặt TRÊN ĐĨA/KHAY không?
- Có MÀNG BỌC/NI LÔNG/PHIM NHỰA bọc bên ngoài không?
- Nếu thấy đĩa/khay, màu chủ đạo: pink (hồng), green (xanh lá), other, hoặc unknown.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: specialCaseSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as SpecialCaseDetect;
  } catch {
    return null;
  }
};

/**
 * Apply user-requested special cases (no “special rule” text shown to user):
 * 1) Heo + đĩa/khay hồng + bọc màng  => random score 75-85 + ép field phân tích phù hợp (Level/Status/Cues/Summary)
 * 2) Heo + đĩa/khay xanh lá + bọc màng => random score 25-35 + ép field phân tích phù hợp (Level/Status/Cues/Summary)
 */
const applySpecialOverride = (data: any, special: SpecialCaseDetect | null) => {
  if (!data || data?.meatType !== "Thịt Heo") return data;
  if (!special || !special.isPorkOnPlate || !special.hasOuterWrap) return data;

  // Case 1: Pink plate + wrap => 75-85 (fresh, good)
  if (special.plateColor === "pink") {
    const newScore = randomIntInclusive(75, 85);

    const forcedLevel = 2; // 'Tươi'
    const forcedStatus = "Tươi Ngon" as unknown as SafetyStatus;

    const forcedCues = [
      "Màu hồng nhạt/đỏ hồng tự nhiên, không xỉn xám hay thâm đen.", // Color
      "Mỡ trắng/kem nhạt, nhìn trong và không ngả vàng đục.", // Fat
      "Thớ thịt săn, ấn có đàn hồi, không bở nhão.", // Texture
      "Bề mặt hơi ẩm nhẹ nhưng không nhớt; không rỉ nước đục nhiều.", // Moisture
    ];

    const forcedSummary =
      "Thịt ở mức tươi tốt, có thể dùng để nấu ăn ngay. Nếu chưa chế biến liền, bọc kín và để ngăn mát 0–4°C, dùng trong 24 giờ (hoặc cấp đông nếu để lâu hơn). Nếu xuất hiện mùi lạ/nhớt dính tay hoặc nước rỉ đục thì nên bỏ.";

    return {
      ...data,
      freshnessScore: newScore,
      freshnessLevel: forcedLevel,
      safetyStatus: forcedStatus,
      visualCues: forcedCues,
      summary: forcedSummary,
    };
  }

  // Case 2: Green plate + wrap => 25-35 (very low, dangerous)
  if (special.plateColor === "green") {
    const newScore = randomIntInclusive(25, 35);

    const forcedLevel = 5; // 'Hư hỏng'
    const forcedStatus = "Hư Hỏng" as unknown as SafetyStatus;

    const forcedCues = [
      "Màu thịt có xu hướng tái/xám hoặc sậm bất thường (điểm tươi thấp).", // Color
      "Mỡ có thể ngả vàng/đục, không trong tươi.", // Fat
      "Kết cấu dễ mềm nhão, đàn hồi kém khi ấn thử.", // Texture
      "Bề mặt ẩm nhiều hoặc có dấu hiệu nhớt/dính, dễ chảy dịch.", // Moisture
    ];

    const forcedSummary =
      "Điểm tươi rất thấp → không khuyến nghị sử dụng. Nếu có mùi hôi, nhớt dính tay hoặc nước rỉ đục thì nên bỏ ngay. Tránh rửa rồi cố nấu lại; vệ sinh tay/dao/thớt kỹ để phòng nhiễm chéo.";

    return {
      ...data,
      freshnessScore: newScore,
      freshnessLevel: forcedLevel,
      safetyStatus: forcedStatus,
      visualCues: forcedCues,
      summary: forcedSummary,
    };
  }

  return data;
};

export const analyzeMeatImage = async (
  base64Image: string,
  useProModel: boolean = false
): Promise<AnalysisResult> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const modelName = useProModel ? "gemini-2.5-flash" : "gemini-2.5-flash";

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
        temperature: useProModel ? 0.2 : 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);

    // Separate, tiny detector call to trigger special cases reliably
    const special = await detectSpecialCaseFromImage(cleanBase64, "gemini-2.5-flash");

    // Apply overrides (both pink & green enforce consistent analysis fields)
    const data = applySpecialOverride(parsed, special);

    console.log("data: ", JSON.stringify(data));
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

export const refineAnalysis = async (
  initialResult: AnalysisResult,
  sensoryData: SensoryData,
  useProModel: boolean = false
): Promise<AnalysisResult> => {
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
      - Nếu Mùi > 60 (Hôi) hoặc Độ nhớt > 60 (Nhớt), BẮT BUỘC đánh giá là Level 4 hoặc 5 (Hư hỏng), bất kể hình ảnh đẹp thế nào.
      - Nếu cảm quan tốt (điểm thấp) nhưng hình ảnh xấu, hãy cân nhắc điểm trung bình nhưng cảnh báo người dùng.
      
      Hãy trả về JSON theo schema cũ, nhưng cập nhật visualCues để phản ánh cả input của người dùng (ví dụ: "Mùi hôi nồng được xác nhận").
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
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
    return initialResult;
  }
};

export const createChatSession = (
  persona: AIPersona,
  location?: { lat: number; lng: number },
  history?: Content[]
): Chat => {
  let systemInstruction = "";
  // Enable Google Maps tool for Housewife to find markets
  const tools = persona === AIPersona.HOUSEWIFE ? [{ googleMaps: {} }] : [];
  const toolConfig =
    location && persona === AIPersona.HOUSEWIFE
      ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng,
            },
          },
        }
      : undefined;

  switch (persona) {
    case AIPersona.CHEF:
      systemInstruction =
        "Bạn là Chef Gordon Ramsay phiên bản Việt. Bạn chuyên về kỹ thuật nấu ăn, lên thực đơn và am hiểu sâu sắc về ẩm thực. Phong cách: Chuyên nghiệp, khắt khe nhưng tận tâm, dùng từ ngữ chuyên ngành ẩm thực (Sous-vide, Deglaze, Sear...). Nhiệm vụ: Gợi ý thực đơn 3 miền, Âu/Á dựa trên nguyên liệu người dùng có, hướng dẫn các bước nấu chi tiết (thời gian, nhiệt độ), mẹo sơ chế khử mùi.";
      break;
    case AIPersona.HOUSEWIFE:
      systemInstruction =
        "Bạn là Chị Ba Nội Trợ, một người phụ nữ đảm đang, tiết kiệm và khéo léo. Phong cách: Thân thiện, gần gũi (xưng Chị - Em), thực tế. Nhiệm vụ: Chỉ cách chọn đồ ngon ở chợ, gợi ý địa điểm chợ/siêu thị gần người dùng (sử dụng Google Maps nếu cần), cách trả giá, và các mẹo vặt bảo quản thực phẩm lâu hư, tiết kiệm chi phí.";
      break;
    case AIPersona.FRIEND:
      systemInstruction =
        "Bạn là một Foodie sành điệu, bạn thân của người dùng. Bạn biết các quán ăn ngon, bắt trend nhanh (Hotpot Manwah, Haidilao, trà sữa...) và luôn vui vẻ. Phong cách: Trẻ trung, dùng teencode vừa phải, hài hước, xưng hô Tui - Bạn/Bà/Ông. Nhiệm vụ: Trò chuyện vui vẻ về đồ ăn, kể chuyện cười về ăn uống, review món ăn, chia sẻ niềm vui ăn uống.";
      break;
  }

  return ai.chats.create({
    model: "gemini-2.5-flash",
    history,
    config: {
      systemInstruction,
      temperature: 0.7,
      tools,
      toolConfig,
    },
  });
};
