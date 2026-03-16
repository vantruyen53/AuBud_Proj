import { useState } from "react";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../assets/styles/authStyle";
import { LinearGradient } from "expo-linear-gradient";
import { linearGradient, Colors } from "@/src/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "../../models/types/RootStackParamList";
import { registerService } from "../../services/auth/registerService";
import { validateEmail, validateOTP, passwordRegex } from "@/src/utils/helper";
import {
  Image, Alert, Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function validateForm(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  if (!fullName)        return "Vui lòng nhập họ tên";
  if (!email.trim())           return "Vui lòng nhập email";
  if (!validateEmail(email))   return "Email không hợp lệ";
  if (!password)               return "Vui lòng nhập mật khẩu";
  if (!passwordRegex(password))
    return "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt";
  if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp";
  return null;
}

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = Dimensions.get("window");

  const navigation = useNavigation<AuthNavigationProp>();

  const handleRegister =async  () => {
    const validationError = validateForm(
      fullName,
      email,
      password,
      confirmPassword
    );

    if (validationError) {
      Alert.alert("Thông tin không hợp lệ", validationError);
      return;
    }

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 50));

    try{
      console.log("1 ==================== Registering started")
      const result = await registerService({
        userName: fullName,
        email:    email.trim().toLowerCase(),
        password,
      });

      if (!result.status) {
        Alert.alert("Đăng ký thất bại", result.message);
        return;
      }

      navigation.navigate("OTPVerificationScreen", {
        email: email.trim().toLowerCase(),
        type: "register",
      });
    } catch (error: any){
        // Phân loại lỗi để hiển thị thông báo phù hợp
        if (error.message?.includes("public key")) {
          Alert.alert(
            "Lỗi kết nối",
            "Không thể kết nối đến server. Vui lòng thử lại."
          );
        } else if (error.message?.includes("Network")) {
          Alert.alert(
            "Lỗi mạng",
            "Kiểm tra kết nối internet của bạn và thử lại."
          );
        } else {
          Alert.alert("Lỗi", error.message ?? "Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
      } finally {
        // Luôn tắt loading dù thành công hay thất bại
        setIsLoading(false);
      }
  };

  const handleSocialRegister = (provider: string) => {
    console.log("Register with:", provider);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.linearGradient, { width }]}
      />
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
                color={Colors.light.iconLight}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AuBud</Text>
            <View style={styles.placeholder} />
          </View>
          {/* Mascot */}
          <View style={styles.mascotContainer}>
            <Image
              source={require("../../assets/images/_logo.png")}
              style={styles.mascot}
              resizeMode="contain"
            />
          </View>
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Register New Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Let's smart budget management right now
            </Text>
          </View>
          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={Colors.light.primaryLight}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCorrect={false}
                />
              </View>
            </View>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Your email"
                  placeholderTextColor={Colors.light.primaryLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={Colors.light.primaryLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={22} color={Colors.light.iconLight} />
                  ) : (
                    <EyeOff size={22} color={Colors.light.iconLight} />
                  )}
                </Pressable>
              </View>
            </View>
            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirn password"
                  placeholderTextColor={Colors.light.primaryLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showPassword ? (
                    <Eye size={22} color={Colors.light.iconLight} />
                  ) : (
                    <EyeOff size={22} color={Colors.light.iconLight} />
                  )}
                </Pressable>
              </View>
            </View>
            {/* Register Button */}
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleRegister}
            >
              <Text style={styles.authButtonText}>Sign up</Text>
            </TouchableOpacity> 
            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialRegister("google")}
              >
                <Image
                  source={{ uri: "https://www.google.com/favicon.ico" }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>
            {/* Login Link */}
            <View style={styles.authContainer}>
              <Text style={styles.authText}>Have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.authLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
