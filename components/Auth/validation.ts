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