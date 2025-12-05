import { useState, useEffect } from 'react';
import { authAPI, handleAuthError } from '../src/services/authService';
import { User, UserSubscription } from '../types';
import { useAuth } from '@/src/context/AuthContext';

export const useProfile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription>({
    isPremium: false,
    plan: 'free'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile
  const loadProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Lấy thông tin user từ API
      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Load subscription từ localStorage (hoặc từ API nếu có)
      const isPremium = localStorage.getItem('isPremium') === 'true';
      const plan = localStorage.getItem('premiumPlan') as 'free' | 'monthly' | 'yearly' || 'free';
      
      setSubscription({
        isPremium,
        plan,
        expiresAt: localStorage.getItem('premiumExpiresAt') || undefined,
      });

    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      console.error('Failed to load profile:', err);
      
      // Fallback to auth user if API fails
      if (authUser) {
        setUser(authUser);
      }
    } finally {
      setLoading(false);
    }
  };

  // // Update profile
  // const updateProfile = async (updates: Partial<User>) => {
  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     const updatedUser = await authAPI.updateProfile(updates);
  //     setUser(updatedUser);
  //     return updatedUser;
  //   } catch (err) {
  //     const errorMessage = handleAuthError(err);
  //     setError(errorMessage);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Upload avatar
  // const uploadAvatar = async (file: File) => {
  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     const { avatarUrl } = await authAPI.uploadAvatar(file);
      
  //     // Update user với avatar mới
  //     if (user) {
  //       const updatedUser = { ...user, avatar: avatarUrl };
  //       setUser(updatedUser);
  //       return avatarUrl;
  //     }
  //   } catch (err) {
  //     const errorMessage = handleAuthError(err);
  //     setError(errorMessage);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    loadProfile();
  }, [isAuthenticated]);

  return {
    user,
    subscription,
    loading,
    error,
    loadProfile,
    // updateProfile,
    // uploadAvatar,
  };
};