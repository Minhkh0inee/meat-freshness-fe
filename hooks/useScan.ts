import { useState } from 'react';
import { scanAPI, CreateScanRequest, ScanResponse, convertAnalysisToScanRequest } from '../src/services/scanService';
import { AnalysisResult, SensoryData, StorageEnvironment, ContainerType } from '../types';
import { handleAuthError } from '../src/services/authService';
import { useAuth } from '@/src/context/AuthContext';

type SaveScanResult = ScanResponse  | null;
type ScanListResult = { scans: ScanResponse[]; total: number; page: number; limit: number; totalPages: number; };

export const useScan = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert base64 to File object (Giữ nguyên)
  const base64ToFile = (base64: string, filename: string = 'scan.jpg'): File => {
    // ... (logic giữ nguyên)
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: 'image/jpeg' });
  };

  // --- HÀM MỚI: MARK AS COOKED (Cần User và phải chờ Auth) ---
  const markScanAsCooked = async (id: string): Promise<ScanResponse | null> => {
    // 1. CHẶN REQUEST KHI ĐANG LOADING
    if (isLoading) throw new Error("Authentication status is still loading. Cannot update status yet.");
    if (!isAuthenticated) throw new Error("User not authenticated. Cannot update status.");

    setLoading(true);
    setError(null);

    try {
      const updatedScan = await scanAPI.markAsCooked(id);
      return updatedScan;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      console.error('Mark as cooked error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // --- HÀM LƯU SCAN (SAVE TO STORAGE - Chỉ cho User đã đăng nhập) ---
  const saveScan = async (
    result: AnalysisResult,
    imageBase64: string,
    sensoryData?: SensoryData,
    storageConfig?: {
      environment: StorageEnvironment;
      container: ContainerType;
    }
  ): Promise<any> => {
    // 1. CHẶN REQUEST KHI ĐANG LOADING
    if (isLoading) throw new Error("Authentication status is still loading. Cannot save scan yet.");
    if (!isAuthenticated) throw new Error("User not authenticated. Cannot save scan.");
    
    setLoading(true);
    setError(null);

    try {
      const imageFile = base64ToFile(imageBase64, `scan_${Date.now()}.jpg`);
      const scanRequest = convertAnalysisToScanRequest(result, sensoryData, storageConfig);
      const savedScan = await scanAPI.createScan(scanRequest, imageFile);
      
      return savedScan;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      console.error('Save scan error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM LẤY DANH SÁCH SCAN (Chỉ cho User đã đăng nhập) ---
  const getUserScans = async (page: number = 1, limit: number = 10): Promise<ScanListResult> => {
    // 1. CHẶN REQUEST KHI ĐANG LOADING
    if (isLoading) return { scans: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    if (!isAuthenticated) return { scans: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    
    setLoading(true);
    setError(null);

    try {
      const result = await scanAPI.getUserScans(page, limit);
      return result;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM LẤY TẤT CẢ SCAN (Chỉ cho User đã đăng nhập) ---
  const getScans = async (): Promise<ScanResponse[]> => {
    // 1. CHẶN REQUEST KHI ĐANG LOADING
    if (isLoading) return [];
    if (!isAuthenticated) return [];
    
    setLoading(true);
    setError(null);

    try {
      const scans = await scanAPI.getScans();
      return scans;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id: string): Promise<void> => {
    if (isLoading) throw new Error("Authentication status is still loading. Cannot delete scan yet.");
    if (!isAuthenticated) throw new Error("User not authenticated. Cannot delete scan.");

    setLoading(true);
    setError(null);

    try {
      await scanAPI.deleteScan(id);
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllUserScans = async (): Promise<void> => {
    if (isLoading) throw new Error("Authentication status is still loading. Cannot clear all scans yet.");
    if (!isAuthenticated) throw new Error("User not authenticated. Cannot clear all scans.");

    setLoading(true);
    setError(null);

    try {
      await scanAPI.deleteAllUserScans();
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateScanStatus = async (id: string, updates: Partial<CreateScanRequest>): Promise<ScanResponse | null> => {
    // 1. CHẶN REQUEST KHI ĐANG LOADING
    if (isLoading) throw new Error("Authentication status is still loading. Cannot update scan status yet.");
    if (!isAuthenticated) throw new Error("User not authenticated. Cannot update scan status.");

    setLoading(true);
    setError(null);

    try {
      const updatedScan = await scanAPI.updateScan(id, updates);
      return updatedScan;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      console.error('Update scan status error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // LƯU Ý: Nếu bạn có hàm performScanAndTrack cho Guest/User, bạn cũng cần cập nhật nó.
  // Tuy nhiên, dựa trên code hiện tại, tôi giả định logic Scan/Tracking chính được xử lý trong Scanner.tsx 
  // bằng cách gọi trực tiếp API hoặc sử dụng một hàm khác không được định nghĩa ở đây.

  return {
    loading,
    error,
    saveScan,
    getScans,
    getUserScans,
    updateScanStatus,
    markScanAsCooked,
    deleteScan, 
    deleteAllUserScans
  };
};