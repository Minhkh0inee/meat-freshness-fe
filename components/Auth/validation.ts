export const validateEmail = (email: string): string | null => {
    if (!email) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return 'Mật khẩu là bắt buộc';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
};

export const validateName = (name: string): string | null => {
    if (!name) return 'Tên là bắt buộc';
    if (name.length < 2) return 'Tên phải có ít nhất 2 ký tự';
    return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Xác nhận mật khẩu là bắt buộc';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
};