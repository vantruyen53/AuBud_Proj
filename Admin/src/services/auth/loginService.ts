import CryptoJS from 'crypto-js';
import { apiClient } from '../../utils/configs/axios.config';

// ✅ Sửa lại toàn bộ loginService
export async function loginService(email: string, password: string) {
  const passwordSHA256 = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password: passwordSHA256, // ✅ gửi trực tiếp, không wrap thêm
    });

    const data = response.data;

    if(!data.status)
      return{status:false, message:data.message}

    // ✅ Kiểm tra role ngay sau khi nhận response
    if (data.user.role !== "admin" && data.user.role !== "superadmin") {
      return { status: false, message: "Tài khoản không có quyền truy cập" };
    }

    return {
      status: true,
      message: "Đăng nhập thành công",
      data: {
        accessToken: data.accessToken,
        email: data.user.email,
      },
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    const message = error.response?.data?.message || "Đăng nhập thất bại";
    return { status: false, message };
  }
}