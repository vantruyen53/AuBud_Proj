import { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../assets/styles/authStyle";
import { linearGradient, Colors, mainColor } from "@/src/constants/theme";
import { useNavigation, StackActions } from "@react-navigation/native";
import { AuthNavigationProp } from "../../models/types/RootStackParamList";
import { signInWithGoogle } from "../../services/auth/Googleauthservice";
import { loginService } from "../../services/auth/loginService";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { passwordRegex, validateEmail } from "@/src/utils/helper";
import { useProvider } from "@/src/hooks/useProvider";
import * as SecureStore from "expo-secure-store";
import { socketService } from "../../services/Socketservice";

function validateForm(
  email: string,
  password: string,
): string | null {
  if (!email.trim())           return "Vui lòng nhập email";
  if (!validateEmail(email))   return "Email không hợp lệ";
  if (!password)               return "Vui lòng nhập mật khẩu";
  if (!passwordRegex(password.trim()))
    return "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt";
  return null;
}

export default function LoginScreen() {
  const { signIn } = useProvider()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { width } = Dimensions.get("window");

  const navigation = useNavigation<AuthNavigationProp>();

  const handleLogin = async () => {
    const validationForm = validateForm(email, password);
    if (validationForm) {
      Alert.alert(validationForm);
      return;
    }

    setLoading(true);

    try{
      const result = await loginService({ email, password });

      if (!result.status) {
        Alert.alert(result.message);
        return;
      } 

      if (result.status) {
        await signIn(result.accessToken, result.refreshToken, result.email);
        socketService.connect(result.accessToken); 
        navigation.dispatch(StackActions.replace("LayoutTabs"));
      }
    } catch (error: any) {
      if (error.message?.includes("public key")) {
          Alert.alert(
            "Lỗi kết nối",
            "Không thể kết nối đến server. Vui lòng thử lại."
          );
        } else if (error.message?.includes("Network")) {
          console.error("Network error:", error);
          Alert.alert(
            "Lỗi mạng",
            "Kiểm tra kết nối internet của bạn và thử lại."
          );
        } else {
          Alert.alert("Lỗi", error.message ?? "Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
    }finally {
        // Luôn tắt loading dù thành công hay thất bại
        setLoading(false);
      }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // 1. Lấy idToken từ Google
      console.log("Bắt đầu đăng nhập với Google...");
      const data = await signInWithGoogle();

      console.log('Login hoàn tất: ', data)
      if(data.status) {
        await signIn(data.accessToken, data.refreshToken, data.user.email);
        navigation.dispatch(StackActions.replace("LayoutTabs"));
      } else {
        Alert.alert("Đăng nhập thất bại", data.message);
      }

    } catch (error: any) {
      Alert.alert("Không thể đăng nhập", error.message ?? "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.welcomeTitle}>Welcome to AuBud</Text>
            <Text style={styles.welcomeSubtitle}>
              Manage your budget become easy and effective
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Your email"
                  placeholderTextColor={mainColor}
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
                  placeholderTextColor={mainColor}
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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
              <Text style={styles.authButtonText}>Sign in</Text>
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
                onPress={() => handleGoogleLogin()}
              >
                <Image
                  source={{ uri: "https://www.google.com/favicon.ico" }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.authContainer}>
              <Text style={styles.authText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("SignUpScreen");
                }}
              >
                <Text style={styles.authLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
