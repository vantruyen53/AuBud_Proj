import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import styles from "../../assets/styles/authStyle";
import { Eye, EyeOff, ShieldCheck  } from 'lucide-react-native';
import {Colors, mainColor } from "@/src/constants/theme";
import { useNavigation, useRoute,type RouteProp,} from "@react-navigation/native";
import { AuthNavigationProp } from "../../models/types/RootStackParamList";
import {passwordRegex} from '@/src/utils/helper';
import { resetPasswordService } from "@/src/services/auth/resetPasswordService";

type ResetPasswordParam = {
    ResetPasswordScreen: {
        email: string;
    }
}

function validatePW(password: string, confirmPassword: string): string {
  if (!passwordRegex(password))
    return "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt";
  if (!password || !confirmPassword) return "Vui lòng nhập mật khẩu";

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return "";
}

export default function ResetPasswordScreen(){
    const route = useRoute<RouteProp<ResetPasswordParam, "ResetPasswordScreen">>();
    const { email } = route.params;

    const navigation = useNavigation<AuthNavigationProp>();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (pass: string) => {
        if (pass.length === 0) return 0;
        if (pass.length < 6) return 1;
        if (pass.length < 8) return 2;
        return 3;
    };

    const strength = getPasswordStrength(password);
    const strengthColors = ["#E0E0E0", "#FF5252", "#FFC107", "#4CAF50"];
    const strengthLabels = ["", "Weak", "Medium", "Perfect"];

    const handleResetPassword = async () => {
        const validationError = validatePW(password, confirmPassword);
        if (validationError) {
            Alert.alert("Error", validationError);
            return;
        }

        const payload = {
            email: email,
            newPassword: password,
        };

        const result = await resetPasswordService(payload);
        if (!result.success) {
            Alert.alert("Error", result.message);
            return;
        }

        Alert.alert(
          "Thành công",
          "Tài khoản đã được xác thực. Vui lòng đăng nhập.",
          [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
        );

        navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
        });
    };

    return(
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
             behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}>
                <ScrollView
                contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => {}}>
                        <MaterialIcons name="arrow-back-ios" size={20} color={Colors.light.iconLight} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Security</Text>
                        <View style={styles.placeholder} />
                    </View>
                    {/* Lock Icon */}
                    <View style={styles.mascotContainer}>
                        <MaterialIcons name="lock" size={50} color={mainColor} />
                    </View>

                    {/* Title Text */}
                    <View style={styles.textContainer}>
                        <Text style={styles.welcomeTitle}>Set A New Password</Text>
                        <Text style={styles.welcomeSubtitle}>
                        Let's select a strong password to protect a account
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* New Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>New password</Text>
                            <View style={[styles.inputWrapper]}>
                                <TextInput
                                style={styles.input}
                                placeholder="••••••••••••"
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
                                {
                                    showPassword ? (
                                        <Eye size={22} color={Colors.light.iconLight}/>
                                    ) : (
                                    <EyeOff size={22} color={Colors.light.iconLight}/>
                                    )
                                }
                                </Pressable>
                            </View>
                        </View>

                        {/* Password Strength */}
                         {password.length > 0 && (
                        <View style={styles.strengthContainer}>
                            <View style={styles.strengthHeader}>
                            <View style={styles.strengthLabelRow}>
                                <ShieldCheck size={16} color={strengthColors[strength]} />
                                <Text style={styles.strengthTitle}>Password strength</Text>
                            </View>
                            <Text style={[styles.strengthValue, { color: strengthColors[strength] }]}>
                                {strengthLabels[strength]}
                            </Text>
                            </View>
                            <View style={styles.strengthBarBg}>
                            <View
                                style={[
                                styles.strengthBarFill,
                                {
                                    width: `${(strength / 3) * 100}%`,
                                    backgroundColor: strengthColors[strength],
                                },
                                ]}
                            />
                            </View>
                            {
                                (strength == 3) ? (
                                    <View style={styles.strengthHint}>
                                        <MaterialIcons name="gpp-good" size={14} color={Colors.light.iconLight} />
                                        <Text style={styles.strengthHintText}>Your password is very secure!</Text>
                                    </View>
                                ) : (null)
                            }
                        </View>
                        )}

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Connfirm password</Text>
                            <View style={[styles.inputWrapper, { marginTop: 8 }]}>
                                <TextInput
                                style={styles.input}
                                placeholder="••••••••••••"
                                placeholderTextColor={Colors.light.primaryLight}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                />
                                {confirmPassword.length > 0 && confirmPassword === password && (
                                <MaterialIcons name="check-circle" size={22} color={mainColor} style={{ marginRight: 8 }} />
                                )}
                                <Pressable
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                                >
                                {
                                    showPassword ? (
                                        <Eye size={22} color={Colors.light.iconLight}/>
                                    ) : (
                                    <EyeOff size={22} color={Colors.light.iconLight}/>
                                    )
                                }
                                </Pressable>
                            </View>
                        </View>

                        {/* Security Tips */}
                        <View style={styles.tipsContainer}>
                            <Text style={styles.tipsTitle}>SECURITY TIPS:</Text>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipBullet}>•</Text>
                                <Text style={styles.tipText}>At least 8 characters</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipBullet}>•</Text>
                                <Text style={styles.tipText}>Includes letters and numbers</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Text style={styles.tipBullet}>•</Text>
                                <Text style={styles.tipText}>Avoid using your date of birth.</Text>
                            </View>
                        </View>

                        {/* Complete Button */}
                        <TouchableOpacity style={styles.authButton} onPress={handleResetPassword}>
                            <Text style={styles.authButtonText}>Done</Text>
                            <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}