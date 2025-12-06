import api from './api';
import { AnalysisResult, SensoryData, StorageEnvironment, ContainerType, ActionStatus } from '../../types';

export interface CreateScanRequest {
  // Remove imageUrl, will be uploaded as file
  meatType: string;
  freshnessScore: number;
  freshnessLevel: number;
  safetyStatus: string;
  visualCues: string[];
  summary: string;
  timestamp: number;
  
  // Optional sensory data for refined scans
  sensoryData?: {
    smell: number;
    texture: number;
    moisture: number;
    drip: number;
  };

  // Storage information
  storageDeadline?: number;
  actionStatus?: ActionStatus;
  storageEnvironment?: StorageEnvironment;
  containerType?: ContainerType;
  isRefined?: boolean;
  usedProModel?: boolean;
}

export interface ScanResponse {
  id: string;
  userId: string;
  imageUrl: string; // Backend will return the uploaded image URL
  meatType: string;
  freshnessScore: number;
  freshnessLevel: number;
  safetyStatus: string;
  visualCues: string[];
  summary: string;
  timestamp: number;
  storageDeadline?: number;
  actionStatus?: ActionStatus;
  storageEnvironment?: StorageEnvironment;
  containerType?: ContainerType;
  createdAt: string;
  updatedAt: string;
}

export const scanAPI = {
  // Tạo scan mới với file upload
  createScan: async (data: CreateScanRequest, imageFile: File): Promise<any> => {
    const formData = new FormData();
    
    // Add the image file
    formData.append('image', imageFile);
    // Add all other data as JSON string or individual fields
    Object.keys(data).forEach(key => {
      const value = data[key as keyof CreateScanRequest];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/scans', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Lấy danh sách scan của user
  getUserScans: async (page: number = 1, limit: number = 10): Promise<{
    scans: ScanResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/scans', {
      params: { page, limit }
    });
    return response.data;
  },

  deleteAllUserScans: async (): Promise<{ deletedCount: number }> => {
    const response = await api.delete('/scans');
    
    // The NestJS backend returns the number of deleted documents (deletedCount)
    return response.data; 
  },

  // Lấy tất cả scans (không phân trang) - để backward compatibility
  getScans: async (): Promise<ScanResponse[]> => {
    const response = await scanAPI.getUserScans(1, 1000); // Get all
    return response.scans;
  },

  // Lấy scan theo ID
  getScan: async (id: string): Promise<ScanResponse> => {
    const response = await api.get(`/scans/${id}`);
    return response.data;
  },

  // Cập nhật scan
  updateScan: async (id: string, data: Partial<CreateScanRequest>): Promise<ScanResponse> => {
    const response = await api.put(`/scans/${id}`, data);
    return response.data;
  },

  deleteScan: async (id: string): Promise<void> => {
    await api.delete(`/scans/${id}`);
  },

  markAsCooked: async (id: string): Promise<ScanResponse> => {
    const response = await api.patch(`/scans/${id}/cooked`, { 
        isCooked: true,
    });
    return response.data;
  },
};

// Helper function để convert AnalysisResult thành CreateScanRequest (no imageUrl)
export const convertAnalysisToScanRequest = (
  result: AnalysisResult,
  sensoryData?: SensoryData,
  storageConfig?: {
    environment: StorageEnvironment;
    container: ContainerType;
  }
): CreateScanRequest => {
  // Tính toán storage deadline
  const getStorageDeadline = (level: number, env: StorageEnvironment, container: ContainerType): number => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    let baseDays = 0;
    
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

  const storageDeadline = storageConfig 
    ? getStorageDeadline(result.freshnessLevel, storageConfig.environment, storageConfig.container)
    : undefined;

  return {
    meatType: result.meatType,
    freshnessScore: result.freshnessScore,
    freshnessLevel: result.freshnessLevel,
    safetyStatus: result.safetyStatus,
    visualCues: result.visualCues,
    summary: result.summary,
    timestamp: result.timestamp,
    sensoryData,
    storageDeadline,
    actionStatus: 'storing',
    storageEnvironment: storageConfig?.environment,
    containerType: storageConfig?.container,
    isRefined: !!sensoryData,
    usedProModel: false,
  };
};