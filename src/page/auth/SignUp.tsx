import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { validateConfirmPassword, validateEmail, validateName, validatePassword } from '@/components/Auth/validation';
import { SignUpRequest } from '@/services/authService';
import { ValidationError } from '@/components/Auth/interface';
import Input from '@/components/Auth/Input';
import Button from '@/components/Auth/Button';
import { useAuth } from '@/src/context/AuthContext';



export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth(); // Sử dụng useAuth hook
  
  const [formData, setFormData] = useState<SignUpRequest>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    
    // Check terms acceptance
    if (!acceptedTerms) {
      setErrors([{
        field: 'terms',
        message: 'Bạn cần đồng ý với điều khoản sử dụng'
      }]);
      return;
    }
    
    // Validate form
    const validationErrors: ValidationError[] = [];
    
    const nameError = validateName(formData.name);
    if (nameError) validationErrors.push({ field: 'name', message: nameError });
    
    const emailError = validateEmail(formData.email);
    if (emailError) validationErrors.push({ field: 'email', message: emailError });
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) validationErrors.push({ field: 'password', message: passwordError });
    
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) validationErrors.push({ field: 'confirmPassword', message: confirmPasswordError });
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    
    try {
      await signUp(formData.name, formData.email, formData.password);
      navigate('/scan');
      
    } catch (error: any) {
      console.error('Sign up failed:', error);
      setErrors([{
        field: 'general',
        message: error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      }]);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo tài khoản
          </h2>
          <p className="text-gray-600">
            Tham gia cùng chúng tôi ngay hôm nay
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
              label="Họ và tên"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={getFieldError('name')}
              placeholder="Nhập họ và tên"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={getFieldError('email')}
              placeholder="Nhập địa chỉ email"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={getFieldError('password')}
              placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
              showPasswordToggle
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={getFieldError('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              showPasswordToggle
              required
            />

            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked && getFieldError('terms')) {
                    setErrors(prev => prev.filter(error => error.field !== 'terms'));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật
              </label>
            </div>
            
            {getFieldError('terms') && (
              <p className="text-sm text-red-600">{getFieldError('terms')}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isLoading} 
            >
              Tạo tài khoản
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
                Đã có tài khoản?{' '}
                <Link
                  to="/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};