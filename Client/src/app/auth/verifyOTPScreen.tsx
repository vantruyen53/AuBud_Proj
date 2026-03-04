import { useRef, useState, createRef, useEffect } from "react";
import styles from "../../assets/styles/authStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Colors, mainColor } from "@/src/constants/theme";
import {useNavigation,useRoute,type RouteProp,
} from "@react-navigation/native";
import { AuthNavigationProp } from "../../models/types/RootStackParamList";
import type { OTPScreenParams } from "@/src/models/types/authType";
import { verifyOtpService, sendOtpService } from "@/src/services/auth/otpService";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPVerificationScreen() {
  const OTP_LENGTH = 6;
  const theme = Colors.light;
  const navigation = useNavigation<AuthNavigationProp>();

  const route = useRoute<RouteProp<OTPScreenParams, "OTPVerificationScreen">>();
  const { email, type } = route.params;
  console.log("OTPVerificationScreen nhận params:", email, type);

  
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef(
    Array.from({ length: OTP_LENGTH }, () => createRef<TextInput>()),
  );

  // 1. Gửi OTP ngay khi màn hình mount
  useEffect(() => {
    sendOtpOnMount();
  }, []);

  const sendOtpOnMount = async () => {
    try {

      await sendOtpService(email);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.message ?? "Không thể gửi OTP. Vui lòng thử lại."
      );
    }
  };

  // 2. Đếm ngược timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ===== OTP CHANGE ===== */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus ô tiếp theo
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].current?.focus();
    }
  };

  /* ===== BACKSPACE ===== */
  const handleBackspace = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].current?.focus();
    }
  };

  /* ===== RESEND OTP ===== */
  const handleResendCode = async() => {
    try {
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(60);

      await sendOtpService(email);

      setTimeout(() => {
        inputRefs.current[0].current?.focus();
      }, 100);

    } catch (error: any) {
      Alert.alert("Lỗi", error.message ?? "Không thể gửi lại OTP");
    }
  };

  /* ===== VERIFY ===== */
  const isOtpComplete = otp.every((d) => d !== ""); 

  const handleVerify =async () => {
    if (!isOtpComplete || isLoading) return;

    setIsLoading(true);

    try{
      const otpCode = otp.join("");

      const serverType = type === "register" ? "REGISTER" : "CHANGE_PASSWORD";

      const success = await verifyOtpService(email, otpCode, serverType);

      if (!success) {
        Alert.alert("Thất bại", "OTP không hợp lệ");
        return;
      }

      if (type === "register") {
        // Đăng ký thành công → về Login
        Alert.alert(
          "Thành công",
          "Tài khoản đã được xác thực. Vui lòng đăng nhập.",
          [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
        );
      } else {
        // Quên mật khẩu → sang đổi mật khẩu
        navigation.navigate("ResetPasswordScreen", { email });
      }

    } catch (error: any) {
      Alert.alert("Lỗi", error.message ?? "Xác thực OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons
                name="arrow-back-ios"
                size={20}
                color={mainColor}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify OTP</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Lock Icon */}
          <View style={styles.mascotContainer}>
            <MaterialIcons name="lock" size={170} color={mainColor} />
          </View>

          {/* Title Text */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Verify OTP</Text>
            <Text style={styles.welcomeSubtitle}>
              Please enter the {OTP_LENGTH}-digit code sent to your email
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleBackspace(nativeEvent.key, index)
                }
                keyboardType="numeric"
                maxLength={1}
                ref={inputRefs.current[index]}
                autoFocus={index === 0}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit ? theme.primary : theme.border,
                    backgroundColor: digit ? theme.primaryLight : theme.inputBg,
                    color: theme.textMain,
                  },
                ]}
              />
            ))}
          </View>

          {/* Resend Timer */}
          <View style={styles.timerContainer}>
            <MaterialIcons
              name="access-time-filled"
              size={16}
              color={mainColor}
            />
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code after <Text style={styles.timerBold}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.timerBold}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.authButton, !isOtpComplete && { opacity: 0.5 }]}
            disabled={!isOtpComplete}
            onPress={handleVerify}
          >
            <Text style={styles.authButtonText}>Verify</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
