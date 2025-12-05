import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SignInRequest, ValidationError } from '@/components/Auth/interface';
import { validateEmail, validatePassword } from '@/components/Auth/validation';
import Input from '@/components/Auth/Input';
import Button from '@/components/Auth/Button';


export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth(); // Sử dụng useAuth hook
  
  const [formData, setFormData] = useState<SignInRequest>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error khi user nhập
    if (errors.find(error => error.field === name)) {
      setErrors(prev => prev.filter(error => error.field !== name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors: ValidationError[] = [];
    
    const emailError = validateEmail(formData.email);
    if (emailError) validationErrors.push({ field: 'email', message: emailError });
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) validationErrors.push({ field: 'password', message: passwordError });
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    
    try {
      // Call API thông qua AuthContext
      await signIn(formData.email, formData.password);
      
      // Nếu thành công, navigate to main app
      navigate('/scan');
      
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setErrors([{
        field: 'general',
        message: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      }]);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng nhập
          </h2>
          <p className="text-gray-600">
            Chào mừng bạn quay trở lại
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {getFieldError('general') && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{getFieldError('general')}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={getFieldError('email')}
              placeholder="Nhập email của bạn"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={getFieldError('password')}
              placeholder="Nhập mật khẩu"
              showPasswordToggle
              required
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading} // Sử dụng isLoading từ AuthContext
            >
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};