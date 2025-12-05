
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wind, Drumstick, Beef, ChefHat, ShieldCheck, Utensils, Eye, Fingerprint, AlertTriangle, Thermometer, Package, Snowflake, Refrigerator, Layers, Archive } from 'lucide-react';
import { MeatType, DictionaryLevelData } from '@/types';

// Extended Data Interface for Deep Education
interface ExtendedDictionaryData extends DictionaryLevelData {
  // Sensory
  visualDetails: string[];
  tactileDetails: string;
  smellDetails: string;
  
  // Safety
  safetyAdvice: string;
  
  // Culinary
  cookingTip: string;
  recommendedDishes: string[];
  
  // Detailed Storage (Merged Logic)
  storageFridge: string;   
  storageFreezer: string;  
  packagingAdvice: string; 
  
  // Thawing (New Separate Field)
  thawingAdvice: string;
}

const dictionaryData: Record<MeatType, Record<number, ExtendedDictionaryData>> = {
  [MeatType.PORK]: {
    1: {
      label: "Tươi Rói",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      colorDescription: "Hồng nhạt sáng, mỡ trắng trong.",
      smellDescription: "Thơm nhẹ đặc trưng.",
      textureDescription: "Dẻo, dính tay, đàn hồi ngay.",
      storageTip: "Cho vào tủ lạnh trong vòng 30-60 phút sau khi mua.",
      
      visualDetails: ["Màu hồng sáng đồng đều", "Mỡ trắng, không có đốm xuất huyết", "Bề mặt khô ráo, không rỉ dịch"],
      tactileDetails: "Khi ấn ngón tay, thịt lõm xuống và đàn hồi lại ngay. Cảm giác dẻo, hơi dính nhẹ tay.",
      smellDetails: "Mùi thơm nhẹ, dễ chịu, không có mùi lạ.",
      
      safetyAdvice: "An toàn tuyệt đối. Thịt đang ở trạng thái hoàn hảo nhất. Vi khuẩn chưa phát triển mạnh.",
      
      cookingTip: "Nhiệt độ nấu chín an toàn: ≥ 63°C (nghỉ 3 phút). Luộc hoặc Hấp để tận hưởng vị ngọt tự nhiên.",
      recommendedDishes: ["Thịt luộc cuốn bánh tráng", "Sườn nướng tảng", "Cháo sườn"],
      
      packagingAdvice: "Bọc 2 lớp: Lớp trong màng bọc thực phẩm sát mặt thịt, lớp ngoài túi zip/hộp kín. Ép hết không khí ra ngoài để tránh oxy hóa.",
      storageFridge: "Ngăn mát (≤ 4°C): 3–5 ngày (Miếng lớn ≥ 500g); 1-2 ngày (Thịt xay).",
      storageFreezer: "Ngăn đông (≤ –18°C): 4–12 tháng (Miếng lớn); 3-4 tháng (Thịt xay).",
      
      thawingAdvice: "❄️ 3 PHƯƠNG PHÁP RÃ ĐÔNG CHUẨN:\n\n1. Ngăn mát (Khuyên dùng 🌟): \n   - Thời gian: 12-24h.\n   - Ưu điểm: Giữ trọn cấu trúc, ít mất nước, an toàn nhất.\n\n2. Nước lạnh (Nhanh):\n   - Cách làm: Bọc kín túi, ngâm nước lạnh, thay nước mỗi 30p.\n   - Thời gian: 1-2h.\n   - Lưu ý: Tuyệt đối không dùng nước nóng.\n\n3. Vi sóng (Khẩn cấp):\n   - Lưu ý: Phải nấu ngay lập tức sau khi rã đông vì thịt đã bị làm nóng một phần."
    },
    2: {
      label: "Tươi",
      color: "text-lime-600",
      bgColor: "bg-lime-50",
      colorDescription: "Đỏ hồng hơi sẫm, bề mặt se.",
      smellDescription: "Mùi bình thường.",
      textureDescription: "Đàn hồi tốt, hơi ướt.",
      storageTip: "Rửa sạch, thấm khô nếu nấu ngay.",
      
      visualDetails: ["Màu đỏ sậm hơn cấp độ 1", "Lớp mỡ hơi ngà (không vàng khè)", "Mặt cắt có độ bóng nhẹ"],
      tactileDetails: "Độ đàn hồi vẫn tốt. Bề mặt bớt dính, chuyển sang cảm giác ẩm mát.",
      smellDetails: "Mùi trung tính, không hôi.",
      
      safetyAdvice: "An toàn. Đảm bảo thịt không ở ngoài nhiệt độ phòng (5-60°C) quá 2 giờ.",
      
      cookingTip: "Nấu chín kỹ ≥ 63°C. Phù hợp các món kho, xào nhanh gia vị thấm tốt.",
      recommendedDishes: ["Thịt rang cháy cạnh", "Thịt kho tàu", "Canh bí đao"],
      
      packagingAdvice: "Thấm khô bề mặt trước khi bọc. Chia nhỏ thành từng phần 300-500g vừa ăn để tránh cấp đông lại phần thừa.",
      storageFridge: "Ngăn mát (≤ 4°C): 2-3 ngày.",
      storageFreezer: "Ngăn đông (≤ –18°C): 3-4 tháng.",
      
      thawingAdvice: "⚠️ LƯU Ý QUAN TRỌNG:\n\n- Tuyệt đối không rã đông ở nhiệt độ phòng (trên bàn bếp) vì vi khuẩn nhân đôi mỗi 20 phút.\n- Nếu dùng lò vi sóng: Hãy dùng chế độ Defrost (công suất thấp) và xoay lật thịt liên tục để tránh bị chín ép bên ngoài."
    },
    3: {
      label: "Kém Tươi",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      colorDescription: "Đỏ thẫm/Tái, mỡ vàng.",
      smellDescription: "Hơi tanh, mất mùi thơm.",
      textureDescription: "Đàn hồi chậm.",
      storageTip: "Nấu NGAY LẬP TỨC.",
      
      visualDetails: ["Màu đỏ nâu hoặc hơi tái", "Có nước dịch màu hồng chảy ra khay", "Mỡ chuyển màu vàng nhạt"],
      tactileDetails: "Thịt mềm nhão. Ấn vào thấy vết lõm giữ nguyên vài giây mới hồi. Cảm giác ướt át.",
      smellDetails: "Mùi hơi tanh, nồng nhẹ.",
      
      safetyAdvice: "Vi khuẩn đã bắt đầu sinh sôi. Cần sơ chế kỹ. Rửa nước muối loãng trước khi chế biến.",
      
      cookingTip: "Nấu chín kỹ ≥ 71°C (đặc biệt là thịt xay). Dùng gia vị mạnh (tiêu, tỏi, nước mắm) để khử mùi.",
      recommendedDishes: ["Thịt kho tiêu", "Ba chỉ chiên giòn", "Giả cầy"],
      
      packagingAdvice: "Rửa sạch bằng nước muối loãng, thấm thật khô. Ướp gia vị ngay (muối, tỏi) để ức chế vi khuẩn.",
      storageFridge: "Tối đa 12-24 giờ. Không nên để lâu hơn.",
      storageFreezer: "KHÔNG KHUYẾN KHÍCH. Cấu trúc tế bào đã yếu, đông đá sẽ làm thịt bở nát khi rã đông.",
      
      thawingAdvice: "🚫 KHÔNG CẦN RÃ ĐÔNG (Nếu đã lỡ đông):\n\nVì thịt đã kém tươi, việc rã đông chậm sẽ tạo cơ hội cho vi khuẩn bùng phát. Hãy nấu trực tiếp từ trạng thái đông (nếu thái nhỏ) hoặc rã đông nhanh bằng lò vi sóng và nấu ngay lập tức."
    },
    4: {
      label: "Có Nguy Cơ",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      colorDescription: "Xám nhạt, chảy nhớt.",
      smellDescription: "Mùi ôi, chua.",
      textureDescription: "Nhớt dính, không đàn hồi.",
      storageTip: "VỨT BỎ.",
      
      visualDetails: ["Màu tái nhợt, có đốm xanh/xám", "Chảy nhớt đục", "Mỡ vàng khè"],
      tactileDetails: "Rất nhớt. Cảm giác trơn trượt (Slimy). Ấn vào thịt nhũn ra, không đàn hồi.",
      smellDetails: "Mùi chua nồng, mùi thiu.",
      
      safetyAdvice: "Nguy hiểm! Nguy cơ ngộ độc thực phẩm cao. Vi khuẩn Salmonella và E.coli đang hoạt động mạnh.",
      
      cookingTip: "KHÔNG CHẾ BIẾN. Nhiệt độ nấu thông thường không thể loại bỏ hết độc tố do vi khuẩn tiết ra.",
      recommendedDishes: ["KHÔNG ĂN"],
      
      packagingAdvice: "Cho vào túi nilon buộc chặt, dán nhãn 'Hỏng' rồi vứt vào thùng rác.",
      storageFridge: "KHÔNG LƯU TRỮ.",
      storageFreezer: "KHÔNG LƯU TRỮ.",
      
      thawingAdvice: "⛔ KHÔNG RÃ ĐÔNG. VỨT BỎ NGAY."
    },
    5: {
      label: "Hư Hỏng",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      colorDescription: "Xanh lục, thâm đen.",
      smellDescription: "Thối nồng nặc.",
      textureDescription: "Rữa nát.",
      storageTip: "VỨT BỎ NGAY.",
      
      visualDetails: ["Xanh đen, mốc", "Rỉ dịch vàng đục/xanh", "Cấu trúc bị phá hủy hoàn toàn"],
      tactileDetails: "Nát bấy.",
      smellDetails: "Mùi thối (Amoniac, H2S).",
      
      safetyAdvice: "Độc tố Botulinum có thể gây tử vong. Vứt bỏ ngay lập tức và rửa tay sạch bằng xà phòng.",
      
      cookingTip: "TUYỆT ĐỐI KHÔNG ĂN.",
      recommendedDishes: ["VỨT BỎ"],
      
      packagingAdvice: "Đeo găng tay khi xử lý. Gói kín nhiều lớp nilon để tránh mùi hôi lan ra nhà.",
      storageFridge: "VỨT BỎ.",
      storageFreezer: "VỨT BỎ.",
      
      thawingAdvice: "⛔ KHÔNG RÃ ĐÔNG. VỨT BỎ NGAY."
    }
  },
  [MeatType.BEEF]: {
    1: {
      label: "Tươi Rói",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      colorDescription: "Đỏ tươi (Cherry Red).",
      smellDescription: "Mùi gây đặc trưng.",
      textureDescription: "Mịn, khô ráo, đàn hồi.",
      storageTip: "Hút chân không là tốt nhất.",
      
      visualDetails: ["Đỏ tươi rực rỡ", "Thớ thịt nhỏ mịn", "Mỡ cứng, màu vàng kem hoặc trắng"],
      tactileDetails: "Chắc tay. Ấn vào đàn hồi mạnh. Bề mặt se, không ướt.",
      smellDetails: "Mùi bò (gây) nhẹ, dễ chịu.",
      
      safetyAdvice: "An toàn tuyệt đối. Có thể ăn tái (Rare) hoặc sống (Tartare) nếu nguồn gốc đảm bảo.",
      
      cookingTip: "Nhiệt độ an toàn: Miếng lớn ≥ 63°C (Medium Rare). Steak nên để nghỉ 3-5 phút sau khi nấu để nước thịt tỏa đều.",
      recommendedDishes: ["Beefsteak", "Bò lúc lắc", "Phở tái"],
      
      packagingAdvice: "Không rửa thịt bò bằng nước (làm đen thịt). Thấm khô bằng khăn giấy. Hút chân không là lý tưởng nhất.",
      storageFridge: "Ngăn mát (≤ 4°C): 3-5 ngày (Tảng lớn). Nên để nguyên tảng sẽ bảo quản tốt hơn thái lát.",
      storageFreezer: "Ngăn đông (≤ –18°C): 6-12 tháng (Tảng lớn). Bò rất bền với nhiệt độ thấp.",
      
      thawingAdvice: "🥩 RÃ ĐÔNG STEAK CHUẨN:\n\n1. Chậm (Best): Để ngăn mát 24h trước khi nấu. Giữ cấu trúc thớ thịt hoàn hảo cho món Steak.\n\n2. Nhanh: Ngâm túi kín trong nước lạnh.\n\n⚠️ TỐI KỴ: Rã đông bằng lò vi sóng cho bò bít tết. Nó sẽ làm miếng bò bị chín tái bên ngoài, sống bên trong và mất nước nghiêm trọng."
    },
    2: {
      label: "Tươi",
      color: "text-lime-600",
      bgColor: "bg-lime-50",
      colorDescription: "Đỏ sậm, mặt se.",
      smellDescription: "Mùi gây nhẹ.",
      textureDescription: "Đàn hồi tốt.",
      storageTip: "Bọc kín, tránh chồng lên nhau.",
      
      visualDetails: ["Đỏ sậm hoặc đỏ tía (do thiếu oxy nhẹ)", "Mỡ vẫn sáng màu", "Không có nhớt"],
      tactileDetails: "Mềm mại, đàn hồi tốt.",
      smellDetails: "Mùi bình thường.",
      
      safetyAdvice: "An toàn. Màu sậm có thể do thiếu oxy (vật lý), để ra ngoài 15p sẽ đỏ lại (hiện tượng 'blooming').",
      
      cookingTip: "Nấu chín vừa (Medium). Mềm hơn Level 1 do quá trình Aging tự nhiên.",
      recommendedDishes: ["Bò xào", "Bò kho", "Bò hầm"],
      
      packagingAdvice: "Bọc kín bằng màng bọc thực phẩm, ép sát bề mặt thịt để tránh không khí lọt vào làm đen thịt thêm.",
      storageFridge: "Ngăn mát: 2-3 ngày. Nếu đã thái lát mỏng thì chỉ nên để 1 ngày.",
      storageFreezer: "Ngăn đông: 6 tháng.",
      
      thawingAdvice: "❄️ RÃ ĐÔNG:\n\n1. Nước lạnh: Bọc thật kín túi zip, ngâm nước lạnh (thay mỗi 30p). Mất khoảng 1h cho 500g thịt.\n   - Ưu điểm: Nhanh hơn để tủ lạnh.\n   - Nhược điểm: Tốn công thay nước."
    },
    3: {
      label: "Kém Tươi",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      colorDescription: "Nâu sẫm, mỡ xám.",
      smellDescription: "Mất mùi gây, hơi nồng.",
      textureDescription: "Ướt, kém đàn hồi.",
      storageTip: "Nấu ngay. Không để qua đêm.",
      
      visualDetails: ["Màu nâu xám bao phủ (Oxy hóa)", "Bề mặt ướt nước", "Mỡ mềm nhũn"],
      tactileDetails: "Dính nhớt nhẹ. Ấn vào vết lõm lâu hồi.",
      smellDetails: "Hơi nồng, mùi kim loại nhẹ.",
      
      safetyAdvice: "Không nên ăn tái. Phải nấu chín hoàn toàn (Well-done ≥ 71°C) để diệt khuẩn bề mặt.",
      
      cookingTip: "Ướp đậm gia vị (gừng, tỏi, rượu vang) để át mùi và màu. Hầm kỹ.",
      recommendedDishes: ["Bò sốt vang", "Cà ri bò", "Bò hầm tiêu"],
      
      packagingAdvice: "Sơ chế sạch, thấm khô, thái nhỏ và tẩm ướp gia vị ngay (Rượu vang/Gừng) nếu chưa nấu kịp.",
      storageFridge: "Nấu ngay trong ngày.",
      storageFreezer: "Không khuyến khích. Thịt sẽ bị khô và bở sau khi rã đông.",
      
      thawingAdvice: "⚡ NÊN NẤU NGAY:\n\nThịt đã bắt đầu oxy hóa mạnh. Hạn chế rã đông nhiều lần. Nếu thịt đang đông đá, hãy nấu trực tiếp món hầm hoặc súp."
    },
    4: {
      label: "Có Nguy Cơ",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      colorDescription: "Nâu xám, vệt xanh.",
      smellDescription: "Mùi chua, ôi.",
      textureDescription: "Nhớt, chảy nước đục.",
      storageTip: "VỨT BỎ.",
      
      visualDetails: ["Màu xám xịt", "Có đốm xanh", "Nhớt kéo màng"],
      tactileDetails: "Trơn tuột (Slimy). Rất nhớt.",
      smellDetails: "Mùi chua khó chịu.",
      
      safetyAdvice: "Không an toàn. Nguy cơ ngộ độc cao.",
      
      cookingTip: "KHÔNG ĂN.",
      recommendedDishes: ["KHÔNG ĂN"],
      
      packagingAdvice: "Gói kín và vứt bỏ.",
      storageFridge: "KHÔNG.",
      storageFreezer: "KHÔNG.",
      
      thawingAdvice: "⛔ KHÔNG RÃ ĐÔNG. VỨT BỎ."
    },
    5: {
      label: "Hư Hỏng",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      colorDescription: "Đen, xanh lục.",
      smellDescription: "Thối rữa.",
      textureDescription: "Nát bấy.",
      storageTip: "VỨT BỎ.",
      
      visualDetails: ["Đen sì hoặc xanh lét", "Mốc", "Dòi bọ"],
      tactileDetails: "Nát.",
      smellDetails: "Mùi tử khí.",
      
      safetyAdvice: "Độc tố chết người.",
      
      cookingTip: "KHÔNG ĂN.",
      recommendedDishes: ["VỨT BỎ"],
      
      packagingAdvice: "Xử lý như rác thải nguy hại.",
      storageFridge: "KHÔNG.",
      storageFreezer: "KHÔNG.",
      
      thawingAdvice: "⛔ KHÔNG RÃ ĐÔNG. VỨT BỎ."
    }
  },
  [MeatType.CHICKEN]: {
    1: {
      label: "Tươi Rói",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      colorDescription: "Hồng nhạt/Kem, da vàng óng.",
      smellDescription: "Không mùi.",
      textureDescription: "Săn chắc, da dính thịt.",
      storageTip: "Lạnh dưới 4°C ngay lập tức.",
      
      visualDetails: ["Thịt màu hồng nhạt hoặc màu be sáng", "Bóng nhẹ, ẩm nhưng không ướt", "Không có vết bầm tím"],
      tactileDetails: "Ấn vào nảy ngay. Sờ vào thấy mát, mịn, hơi ẩm.",
      smellDetails: "Gần như không mùi.",
      
      safetyAdvice: "Luôn nấu chín kỹ. Thịt gà chứa Salmonella tự nhiên, tuyệt đối không được ăn tái.",
      
      cookingTip: "Nhiệt độ nấu chín: ≥ 74°C (quan trọng). Luộc, Hấp để cảm nhận độ dai giòn.",
      recommendedDishes: ["Gà luộc lá chanh", "Gà hấp muối", "Gỏi gà"],
      
      packagingAdvice: "Đặt khay hứng bên dưới để nước gà không rò rỉ. Không rửa gà dưới vòi nước mạnh (tránh bắn vi khuẩn).",
      storageFridge: "Ngăn mát (≤ 4°C): 1-2 ngày. Gà hỏng nhanh hơn bò/heo.",
      storageFreezer: "Ngăn đông (≤ –18°C): 12 tháng (nguyên con), 9 tháng (chặt miếng), 3-4 tháng (nội tạng).",
      
      thawingAdvice: "🍗 RÃ ĐÔNG GÀ AN TOÀN:\n\n1. Ngăn mát (Ưu tiên số 1): Mất khoảng 24h cho gà nguyên con (1.5kg+).\n\n2. Nước lạnh: Bọc thật kín, ngâm nước lạnh, thay nước mỗi 30p. Khoảng 30p cho mỗi 500g thịt.\n\n⚠️ Lưu ý: Không bao giờ để gà rã đông trên bàn bếp."
    },
    2: {
      label: "Tươi",
      color: "text-lime-600",
      bgColor: "bg-lime-50",
      colorDescription: "Hơi sẫm, da khô.",
      smellDescription: "Mùi nhẹ.",
      textureDescription: "Đàn hồi TB.",
      storageTip: "Nên nấu ngay.",
      
      visualDetails: ["Màu sẫm hơn chút", "Da không còn bóng mẩy"],
      tactileDetails: "Vẫn đàn hồi nhưng không 'nảy' bằng L1.",
      smellDetails: "Bình thường.",
      
      safetyAdvice: "An toàn. Nấu chín kỹ ≥ 74°C.",
      
      cookingTip: "Chiên, kho, nướng sẽ ngon hơn luộc. Rã đông bằng lò vi sóng chỉ khi nấu ngay sau đó.",
      recommendedDishes: ["Gà rán", "Gà kho gừng", "Cánh gà chiên mắm"],
      
      packagingAdvice: "Thấm khô dịch gà bằng khăn giấy rồi vứt khăn đi ngay. Đựng trong hộp kín.",
      storageFridge: "Ngăn mát: 1 ngày.",
      storageFreezer: "Ngăn đông: 6 tháng.",
      
      thawingAdvice: "⚠️ RÃ ĐÔNG VI SÓNG:\n\nNếu dùng lò vi sóng để rã đông gà, hãy lưu ý: Phần cánh hoặc da mỏng có thể bắt đầu chín trong lò. Bạn BẮT BUỘC phải đem đi nấu ngay lập tức sau khi lấy ra khỏi lò để tránh vi khuẩn sinh sôi ở những vùng thịt ấm."
    },
    3: {
      label: "Kém Tươi",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      colorDescription: "Xám nhẹ, da nhăn.",
      smellDescription: "Hơi nồng, lạ.",
      textureDescription: "Mềm nhão, da bong.",
      storageTip: "Sơ chế kỹ với gừng rượu. Nấu ngay.",
      
      visualDetails: ["Thịt trông xám xịt (dull grey)", "Da lỏng lẻo, dễ tách rời", "Có nước đục trong khay"],
      tactileDetails: "Cảm giác hơi dính (tacky) khi chạm vào.",
      smellDetails: "Mùi hơi chua hoặc mùi lạ.",
      
      safetyAdvice: "Nguy cơ nhiễm khuẩn tăng cao. Bắt buộc nấu chín kỹ trên 100°C (sôi sục).",
      
      cookingTip: "Kho đậm, Cari, các món hầm kỹ. Không nếm thử khi chưa chín.",
      recommendedDishes: ["Cà ri gà", "Gà kho sả ớt"],
      
      packagingAdvice: "Rửa gà nhẹ nhàng với muối và gừng/rượu trắng để khử mùi hôi và nhớt. Rửa tay kỹ sau khi sơ chế.",
      storageFridge: "Nấu ngay lập tức. Không lưu trữ.",
      storageFreezer: "Không nên.",
      
      thawingAdvice: "🚫 KHÔNG RÃ ĐÔNG CHẬM:\n\nThịt đã kém chất lượng. Nếu đang đông, hãy nấu ngay hoặc rã đông cực nhanh bằng vi sóng rồi nấu. Không ngâm nước hay để ngăn mát lâu."
    },
    4: {
      label: "Có Nguy Cơ",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      colorDescription: "Xám ngoét, thâm tím.",
      smellDescription: "Mùi chua, hôi.",
      textureDescription: "Nhớt (Biofilm).",
      storageTip: "VỨT BỎ.",
      
      visualDetails: ["Màu xám đục hoàn toàn", "Vết thâm tím trên cánh/đùi", "Lớp nhớt dày bao phủ"],
      tactileDetails: "Rất nhớt (Slimy). Rửa nước vẫn thấy nhớt.",
      smellDetails: "Mùi hôi nồng, mùi amoniac.",
      
      safetyAdvice: "Nguy hiểm. Rửa cũng không sạch hết vi khuẩn.",
      
      cookingTip: "Không ăn.",
      recommendedDishes: ["KHÔNG ĂN"],
      
      packagingAdvice: "Vứt bỏ.",
      storageFridge: "KHÔNG.",
      storageFreezer: "KHÔNG.",
      
      thawingAdvice: "⛔ KHÔNG RÃ ĐÔNG. VỨT BỎ."
    },
    5: {
      label: "Hư Hỏng",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      colorDescription: "Mốc xanh, đen.",
      smellDescription: "Thối nồng nặc.",
      textureDescription: "Nát bấy.",
      storageTip: "VỨT BỎ NGAY.",
      
      visualDetails: ["Mốc", "Xanh/Đen", "Nhũn"],
      tactileDetails: "Nát.",
      smellDetails: "Kinh khủng.",
      
      safetyAdvice: "Độc tố.",
      
      cookingTip: "KHÔNG ĂN.",
      recommendedDishes: ["VỨT BỎ"],
      
      packagingAdvice: "Vứt bỏ.",
      storageFridge: "VỨT BỎ.",
      storageFreezer: "VỨT BỎ.",
      
      thawingAdvice: "⛔ KHÔNG RÃ ĐÔNG. VỨT BỎ."
    }
  },
  [MeatType.UNKNOWN]: {
     1: { label: "Unknown", color: "text-gray-300", bgColor: "bg-gray-50", colorDescription: "", smellDescription: "", textureDescription: "", storageTip: "", visualDetails: [], tactileDetails: "", smellDetails: "", safetyAdvice: "", cookingTip: "", recommendedDishes: [], storageFridge: "", storageFreezer: "", packagingAdvice: "", thawingAdvice: "" },
     2: { label: "Unknown", color: "text-gray-300", bgColor: "bg-gray-50", colorDescription: "", smellDescription: "", textureDescription: "", storageTip: "", visualDetails: [], tactileDetails: "", smellDetails: "", safetyAdvice: "", cookingTip: "", recommendedDishes: [], storageFridge: "", storageFreezer: "", packagingAdvice: "", thawingAdvice: "" },
     3: { label: "Unknown", color: "text-gray-300", bgColor: "bg-gray-50", colorDescription: "", smellDescription: "", textureDescription: "", storageTip: "", visualDetails: [], tactileDetails: "", smellDetails: "", safetyAdvice: "", cookingTip: "", recommendedDishes: [], storageFridge: "", storageFreezer: "", packagingAdvice: "", thawingAdvice: "" },
     4: { label: "Unknown", color: "text-gray-300", bgColor: "bg-gray-50", colorDescription: "", smellDescription: "", textureDescription: "", storageTip: "", visualDetails: [], tactileDetails: "", smellDetails: "", safetyAdvice: "", cookingTip: "", recommendedDishes: [], storageFridge: "", storageFreezer: "", packagingAdvice: "", thawingAdvice: "" },
     5: { label: "Unknown", color: "text-gray-300", bgColor: "bg-gray-50", colorDescription: "", smellDescription: "", textureDescription: "", storageTip: "", visualDetails: [], tactileDetails: "", smellDetails: "", safetyAdvice: "", cookingTip: "", recommendedDishes: [], storageFridge: "", storageFreezer: "", packagingAdvice: "", thawingAdvice: "" },
  }
};

const MeatDictionary: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<MeatType>(MeatType.PORK);
  const [freshnessPercent, setFreshnessPercent] = useState(90);
  const infoRef = useRef<HTMLDivElement>(null);

  // Map percent to Level 1-5
  const getLevelFromPercent = (percent: number): number => {
    if (percent >= 81) return 1; // 81-100% -> Level 1 (Excellent)
    if (percent >= 61) return 2; // 61-80% -> Level 2 (Good)
    if (percent >= 41) return 3; // 41-60% -> Level 3 (Average)
    if (percent >= 21) return 4; // 21-40% -> Level 4 (Bad)
    return 5;                    // 0-20% -> Level 5 (Spoiled)
  };

  const currentLevel = getLevelFromPercent(freshnessPercent);
  const currentData = dictionaryData[selectedType][currentLevel];

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const levelParam = searchParams.get('level');

    if (typeParam) {
        const decodedType = decodeURIComponent(typeParam) as MeatType;
        if(Object.values(MeatType).includes(decodedType)) {
            setSelectedType(decodedType);
        }
    }
    if (levelParam) {
      const lvl = parseInt(levelParam);
      if (lvl >= 1 && lvl <= 5) {
        // Map level back to a default representative percentage
        let defaultPercent = 90;
        switch(lvl) {
            case 1: defaultPercent = 90; break;
            case 2: defaultPercent = 70; break;
            case 3: defaultPercent = 50; break;
            case 4: defaultPercent = 30; break;
            case 5: defaultPercent = 10; break;
        }
        setFreshnessPercent(defaultPercent);
        
        setTimeout(() => {
            infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    }
  }, [searchParams]);

  const meatTabs = [
    { id: MeatType.PORK, icon: <ChefHat className="w-5 h-5" />, label: 'Heo' },
    { id: MeatType.BEEF, icon: <Beef className="w-5 h-5" />, label: 'Bò' },
    { id: MeatType.CHICKEN, icon: <Drumstick className="w-5 h-5" />, label: 'Gà' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-6 font-serif">Từ Điển Thịt</h2>
        
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-rose-100 flex gap-1 max-w-lg mx-auto lg:mx-0">
          {meatTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                selectedType === tab.id 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-rose-50 hover:text-rose-400'
              }`}
            >
              {tab.icon} 
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Freshness Slider (Percentage) */}
      <div className={`rounded-[2rem] p-8 lg:p-12 border transition-colors duration-500 ${currentData.bgColor} border-white shadow-lg shadow-rose-100/50 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-12 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70 flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> Thang đo độ tươi
            </span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur shadow-sm ${currentData.color} border border-white/50`}>
                {freshnessPercent}%
            </div>
        </div>

        {/* Responsive Slider Control */}
        <div className="relative h-16 flex items-center justify-center mb-10 select-none z-10 max-w-3xl mx-auto px-4">
            {/* Track Background */}
            <div className="absolute w-full h-6 bg-white/60 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
                <div className="w-full h-full bg-gradient-to-r from-rose-500 via-yellow-400 to-emerald-500 opacity-80"></div>
            </div>
            
            {/* Slider Input */}
            <input
                type="range" min="0" max="100" step="1" 
                value={freshnessPercent}
                onChange={(e) => setFreshnessPercent(Number(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Custom Thumb / Indicator */}
            <div 
                className="absolute h-12 w-12 bg-white rounded-full shadow-xl border-4 border-white flex items-center justify-center pointer-events-none transition-all duration-75 ease-out"
                style={{ left: `calc(${freshnessPercent}% - 24px)` }}
            >
                <span className={`font-black text-xs ${currentData.color}`}>{freshnessPercent}%</span>
            </div>
        </div>
        
        <div className="text-center mt-2 animate-fade-in-up z-10 relative">
            <h3 className={`text-4xl lg:text-5xl font-black ${currentData.color} mb-4 drop-shadow-sm transition-colors duration-300 font-serif tracking-tight`}>{currentData.label}</h3>
            <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-xs lg:text-sm font-bold uppercase shadow-sm border transition-colors duration-300 ${currentLevel <= 2 ? 'text-emerald-600 border-emerald-100' : currentLevel >= 4 ? 'text-rose-600 border-rose-100' : 'text-slate-600 border-slate-100'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    {currentLevel <= 2 ? 'An toàn tuyệt đối' : currentLevel === 3 ? 'Cần xử lý kỹ' : 'Nguy hiểm'}
                </span>
            </div>
        </div>
      </div>

      {/* Knowledge Hub Grid */}
      <div ref={infoRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up delay-75 scroll-mt-24">
         
         {/* 1. Sensory Analysis Card */}
         <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <Eye className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-xl">Phân tích Cảm quan</h4>
                </div>
                
                <div className="space-y-6">
                    {/* Visual */}
                    <div className="flex gap-4">
                        <div className="w-1 bg-blue-100 rounded-full flex-shrink-0"></div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Thị giác (Nhìn)</span>
                            <ul className="space-y-1.5">
                                {currentData.visualDetails.map((detail, idx) => (
                                    <li key={idx} className="text-slate-700 text-sm font-medium flex items-start gap-2">
                                        <span className="text-blue-400 mt-1">•</span> {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Tactile */}
                    <div className="flex gap-4">
                        <div className="w-1 bg-purple-100 rounded-full flex-shrink-0"></div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Xúc giác (Chạm)</span>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed">{currentData.tactileDetails}</p>
                        </div>
                    </div>

                    {/* Smell */}
                    <div className="flex gap-4">
                         <div className="w-1 bg-rose-100 rounded-full flex-shrink-0"></div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Wind className="w-3 h-3" /> Khứu giác (Ngửi)</span>
                            <p className="text-slate-700 text-sm font-medium">{currentData.smellDetails}</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* 2. Safety Card */}
         <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-rose-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
             <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-5 text-rose-600">
                     <div className="p-2.5 bg-rose-50 rounded-xl">
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                     <h4 className="font-bold text-slate-900 text-xl">An Toàn & Rủi Ro</h4>
                 </div>
                 
                 <div className="space-y-4">
                     <div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Đánh giá chuyên gia</span>
                         <p className={`text-slate-700 text-sm leading-relaxed font-medium p-4 rounded-2xl border ${currentLevel <= 2 ? 'bg-emerald-50 border-emerald-100' : currentLevel === 3 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                            {currentData.safetyAdvice}
                         </p>
                     </div>
                     {currentLevel >= 3 && (
                         <div className="flex items-start gap-2 mt-4">
                             <Utensils className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                             <p className="text-xs text-slate-500 italic">Lưu ý: Vi khuẩn Salmonella và E. coli không thể nhìn thấy bằng mắt thường. Hãy cẩn trọng.</p>
                         </div>
                     )}
                     {/* Danger Zone Info */}
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
                        <strong>Vùng nguy hiểm:</strong> 5°C – 60°C là nhiệt độ vi khuẩn sinh sôi nhanh nhất. Đừng để thịt ở nhiệt độ phòng quá 2 giờ.
                     </div>
                 </div>
             </div>
         </div>

         {/* 3. Expanded Chef's Advice & Storage (Refactored) */}
         <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200">
             <div className="flex items-center gap-3 mb-8">
                 <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    <ChefHat className="w-6 h-6 text-amber-400" />
                 </div>
                 <h4 className="font-bold text-2xl text-white">Lời khuyên từ Chuyên gia</h4>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                 {/* Col 1: Cooking */}
                 <div className="space-y-6">
                     <div>
                         <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3 uppercase tracking-wider">
                             <Utensils className="w-4 h-4" /> Kỹ thuật chế biến
                         </div>
                         <p className="text-slate-300 text-sm font-medium leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                             {currentData.cookingTip}
                         </p>
                     </div>
                     
                     <div>
                         <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Món ngon gợi ý</div>
                         <div className="flex flex-wrap gap-2">
                             {currentData.recommendedDishes.map(dish => (
                                 <span key={dish} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/5 text-white text-sm font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors">
                                     {dish}
                                 </span>
                             ))}
                         </div>
                     </div>
                 </div>

                 {/* Col 2: Merged Preservation Process */}
                 <div className="space-y-4 relative">
                     <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-1 uppercase tracking-wider">
                         <Archive className="w-4 h-4" /> Quy trình bảo quản chuẩn
                     </div>

                     {/* Step 1: Pack */}
                     <div className="relative pl-6 border-l border-white/20 pb-4">
                         <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                         <h5 className="font-bold text-emerald-300 text-sm mb-1">1. Sơ chế & Bao bì</h5>
                         <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{currentData.packagingAdvice}</p>
                     </div>

                     {/* Step 2: Fridge */}
                     <div className="relative pl-6 border-l border-white/20 pb-4">
                         <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400"></div>
                         <h5 className="font-bold text-sky-300 text-sm mb-1">2. Ngăn mát (≤ 4°C)</h5>
                         <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{currentData.storageFridge}</p>
                     </div>

                     {/* Step 3: Freezer */}
                     <div className="relative pl-6 border-l border-white/10">
                         <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                         <h5 className="font-bold text-blue-300 text-sm mb-1">3. Ngăn đông (≤ -18°C)</h5>
                         <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{currentData.storageFreezer}</p>
                     </div>
                 </div>
             </div>
         </div>

         {/* 4. NEW SEPARATE THAWING SECTION */}
         <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-sky-50 to-blue-50 rounded-[2rem] p-6 lg:p-8 border border-sky-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600">
                    <Snowflake className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-slate-800 text-xl">Hướng Dẫn Rã Đông</h4>
             </div>
             <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                 <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line">
                     {currentData.thawingAdvice}
                 </p>
             </div>
         </div>

      </div>
    </div>
  );
};

export default MeatDictionary;
