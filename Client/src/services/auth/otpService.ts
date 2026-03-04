import { API_URL } from "@/src/constants/securityContants";

export async function sendOtpService(email: string): Promise<boolean>{
    const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

  const text = await response.text(); // ← đọc raw text trước
  console.log("sendOtp raw response:", text); // ← log ra xem

  const data = JSON.parse(text)

  if (!response.ok) {
    throw new Error(data.message ?? "Không thể gửi OTP");
  }

  return data.status;
}

export async function verifyOtpService(
  email: string,
  otp: string,
  type: "REGISTER" | "CHANGE_PASSWORD"
): Promise<boolean> {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, type }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "OTP không hợp lệ");
  }

  return data.status;
}