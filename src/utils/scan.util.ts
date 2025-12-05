import { ContainerType, SensoryData, StorageEnvironment } from "@/types";

export const getScanStage = (prog: number, isProMode: boolean) => {
  if (prog < 30) return { text: "Khởi động Vision AI...", icon: 'ScanLine' };
  if (prog < 60) return { text: `Phân tích ${isProMode ? '(Deep Learning)...' : 'sắc tố...'}`, icon: 'Palette' };
  if (prog < 85) return { text: "Kiểm tra cấu trúc bề mặt...", icon: 'Microscope' };
  if (prog < 100) return { text: "Tổng hợp kết quả...", icon: 'Brain' };
  return { text: "Hoàn tất!", icon: 'CheckCircle' };
};

export const calculateStorageDeadline = (level: number, env: StorageEnvironment, container: ContainerType): number => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    let baseDays = 0;
    // ... (Giữ nguyên logic tính toán)
    if (env === 'fridge') {
      baseDays = level === 1 ? 4 : level === 2 ? 3 : level === 3 ? 1 : 0;
    } else if (env === 'freezer') {
      baseDays = level === 1 ? 90 : level === 2 ? 60 : level === 3 ? 7 : 0;
    } else if (env === 'room_temp') {
      baseDays = level === 1 ? 0.17 : level === 2 ? 0.08 : 0;
    }
    
    if (container === 'box') {
      baseDays *= 1.1;
    } else if (container === 'none') {
      baseDays *= 0.8;
    }
    
    return now + (baseDays * oneDay);
};

export const getPredictedSensoryValues = (level: number): SensoryData => {
        switch (level) {
            case 1: return { smell: 5, texture: 5, moisture: 5, drip: 5 }; 
            case 2: return { smell: 25, texture: 20, moisture: 20, drip: 10 }; 
            case 3: return { smell: 55, texture: 50, moisture: 45, drip: 30 }; 
            case 4: return { smell: 80, texture: 85, moisture: 80, drip: 70 }; 
            case 5: return { smell: 95, texture: 95, moisture: 95, drip: 95 }; 
            default: return { smell: 10, texture: 10, moisture: 10, drip: 10 };
        }
    };