import { useState } from "react";
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../assets/styles/authStyle";
import { linearGradient, Colors, mainColor } from "@/src/constants/theme";
import { useNavigation, StackActions } from "@react-navigation/native";
import { AuthNavigationProp } from "../../models/types/RootStackParamList";
import { signInWithGoogle } from "../../services/Googleauthservice";

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
const API_URL = process.env.EXPO_PUBLIC_API_URL!;
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { width } = Dimensions.get("window");

  const navigation = useNavigation<AuthNavigationProp>();

  const handleLogin = () => {
    navigation.dispatch(StackActions.replace("LayoutTabs"));
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // 1. Lấy idToken từ Google
      const { idToken } = await signInWithGoogle();

      // 2. Gửi idToken lên server để verify và nhận JWT
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Đăng nhập thất bại");
      }

      // 3. Lưu JWT vào secure storage (bạn tự triển khai phần này
      //    dùng react-native-keychain hoặc expo-secure-store)
      // await saveToken(data.accessToken);

      // 4. Điều hướng vào app
      navigation.dispatch(StackActions.replace("LayoutTabs"));

    } catch (error: any) {
      Alert.alert("Lỗi", error.message ?? "Đã có lỗi xảy ra");
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
                onPress={() => handleGoogleLogin}
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
