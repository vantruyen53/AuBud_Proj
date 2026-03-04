import { useState } from "react";
import styles from "../../assets/styles/authStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigationProp } from "../../models/types/RootStackParamList";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mainColor, Colors } from "@/src/constants/theme";
import { postEmailToVerify } from "@/src/services/auth/resetPasswordService";
import { validateEmail } from "@/src/utils/helper";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<AuthNavigationProp>();

  const handleSendCode = async () => {
    if (!email.trim())           return "Vui lòng nhập email";
    if (!validateEmail(email))   return "Email không hợp lệ";
      
    const result = await postEmailToVerify(email.trim().toLowerCase());
    if (!result.success) {
      console.log('Status:', result.success);
      console.log("Error verifying email:", result.message);
      Alert.alert(result.message);
      return;
    }
    navigation.navigate("OTPVerificationScreen", {
        email: email.trim().toLowerCase(),
        type: "forgot-password",
      });
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
            <Text style={styles.headerTitle}>Forgor Password?</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Mascot */}
          <View style={styles.mascotContainer}>
            <Image
              source={require("../../assets/images/_happyLogo.png")}
              style={styles.mascot}
              resizeMode="contain"
            />
          </View>

          {/* Title Text */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              Don't worry, we'll help you get your password!
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>YOUR EMAIL</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="email"
                  size={20}
                  color={Colors.light.icon}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor={Colors.light.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            {/* Send Button */}
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleSendCode}
            >
              <Text style={styles.authButtonText}>Send OTP</Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backLoginContainer}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="login" size={20} color={mainColor} />
              <Text style={styles.backLoginText}>Back to Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
