import { useState } from 'react';
import { scanAPI, CreateScanRequest, ScanResponse, convertAnalysisToScanRequest } from '../src/services/scanService';
import { AnalysisResult, SensoryData, StorageEnvironment, ContainerType } from '../types';
import { handleAuthError } from '../src/services/authService';

export const useScan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert base64 to File object
  const base64ToFile = (base64: string, filename: string = 'scan.jpg'): File => {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Create file
    return new File([byteArray], filename, { type: 'image/jpeg' });
  };

  const markScanAsCooked = async (id: string): Promise<ScanResponse | null> => {
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

  const saveScan = async (
    result: AnalysisResult,
    imageBase64: string,
    sensoryData?: SensoryData,
    storageConfig?: {
      environment: StorageEnvironment;
      container: ContainerType;
    }
  ): Promise<any> => {
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

  const getUserScans = async (page: number = 1, limit: number = 10) => {
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

  const getScans = async (): Promise<ScanResponse[]> => {
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

  const updateScanStatus = async (id: string, updates: Partial<CreateScanRequest>): Promise<ScanResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const updatedScan = await scanAPI.updateScan(id, updates);
      return updatedScan;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveScan,
    getScans,
    getUserScans,
    updateScanStatus,
    markScanAsCooked
  };
};