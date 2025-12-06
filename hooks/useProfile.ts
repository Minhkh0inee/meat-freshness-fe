import { useState, useEffect } from 'react';
import { authAPI, handleAuthError } from '../src/services/authService';
import { SubscriptionUpdate, User, UserSubscription } from '../types';
import { useAuth } from '@/src/context/AuthContext';

export const useProfile = () => {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>({
    isPremium: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
        if (isLoading) return; 

        if (isAuthenticated) {
            loadProfile();
        } else {
            setUser(null);
        }
    }, [isAuthenticated, isLoading]);
  // Load user profile
  const loadProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Lấy thông tin user từ API
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      
      setSubscription({
        subscription: userData.subscriptionType
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

  const updateSubscription = async (updates: SubscriptionUpdate): Promise<User> => {
    // Luôn kiểm tra Auth và Loading trước khi gọi API
    if (isLoading) throw new Error("Authentication status is still loading. Cannot update subscription.");
    if (!isAuthenticated) throw new Error("User must be logged in to update subscription.");

    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authAPI.updateSubscription(updates);
      setUser(updatedUser);
      setSubscription({
        subscription: updatedUser.subscriptionType,
        isPro: updatedUser.subscriptionType !== 'free',
      });
      return updatedUser;
      
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      console.error('Failed to update subscription:', err);
      throw new Error(errorMessage);
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
    updateSubscription
    // updateProfile,
    // uploadAvatar,
  };
};