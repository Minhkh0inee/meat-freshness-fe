
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, handleAuthError } from '../services/authService';
import { User } from '@/types';


interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SIGN_OUT' };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        let user: User | null = null;
        
        try {
          user = JSON.parse(userJson) as User;
        } catch(e) {
          console.error("Failed to parse user data:", e);
          // Clear corrupted data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        if (user) {
          // RESTORE user ngay lập tức
          dispatch({ type: 'SET_USER', payload: user });
          
          // TÙY CHỌN: Validate token với backend
          try {
            const freshUser = await authAPI.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: freshUser });
            localStorage.setItem('user', JSON.stringify(freshUser));
          } catch (error: any) {
            // Nếu là lỗi 401 thì mới xóa localStorage
            if (error?.response?.status === 401) {
              console.log("error: ", error)
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              dispatch({ type: 'SIGN_OUT' });
            } else {
              // Nếu là lỗi khác (mạng, server...), giữ nguyên user đã restore
              console.warn('Token validation failed, using cached user data');
              dispatch({ type: 'SET_USER', payload: user });
            }
          }
        } else {
          throw new Error("Invalid user data in local storage.");
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authAPI.signIn({ email, password });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authAPI.signUp({ name, email, password });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Sign out API failed:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      dispatch({ type: 'SIGN_OUT' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};