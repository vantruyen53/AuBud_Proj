import { StyleSheet, Dimensions } from "react-native";
import { mainColor, Colors } from "@/src/constants/theme";

const light = Colors.light;
const dark = Colors.dark;
const main = Colors.main;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: light.background,
    },
    linearGradient:{
        position: "absolute",
        width,
        top: 0,
        left: 0,
        height: 260,
        zIndex: -1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        marginTop:24
    },
    backButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: light.backgroudLight,
        justifyContent: "center",
        alignItems: "center",
        paddingStart:6
    },
    headerTitle: {
        textAlign:"center",
        fontSize: 24,
        fontWeight: "600",
        color: light.textMain,
    },
    placeholder: {
        width: 40,
    },
    mascotContainer: {
        alignItems: "center",
        marginTop:40
    },
    mascot: {
        width: 160,
        height: 160,
    },
    welcomeContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: light.textMain,
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: light.textMain,
        textAlign: "center",
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    titleText: {
        fontSize: 20,
        fontWeight: "700",
        color: light.textTitle,
        textAlign: "center",
        lineHeight: 28,
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: light.textMain,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: light.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: light.border,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: light.textContent
    },
    eyeButton: {
        padding: 8,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: mainColor,
        fontWeight: "500",
    },
    authButton: {
        backgroundColor: mainColor,
        borderRadius: 12,
        height: 52,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: mainColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 25,
        flexDirection:"row"
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: light.background,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: light.divider,
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: light.placeholder,
        fontWeight: "500",
    },
    socialButtons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginBottom: 24,
    },
    socialButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: light.divider,
        borderWidth: 1,
        borderColor: light.divider,
        justifyContent: "center",
        alignItems: "center",
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
    authContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    authText: {
        fontSize: 14,
        color: light.textSub,
    },
    authLink: {
        fontSize: 14,
        color: mainColor,
        fontWeight: "600",
    },
    backLoginContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    backLoginText: {
        fontSize: 14,
        color: mainColor,
        fontWeight: "500",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginBottom: 24,
    },
    otpInput: {
        width: 45,
        height: 45,
        borderRadius: 30, // Circular input
        borderWidth: 1,
        borderColor: light.border,
        backgroundColor: light.background,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600",
        color: light.textMain,
    },
    otpInputFilled: {
        borderColor: mainColor,
        backgroundColor: light.backgroudLight,
    },
    timerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: light.backgroudLight,
        alignSelf: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 30,
        gap: 6,
    },
    timerText: {
        fontSize: 14,
        color: light.textSub,
    },
    timerBold: {
        color: mainColor,
        fontWeight: "700",
    },
    strengthContainer: {
    marginBottom: 20,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  strengthTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: light.textMain,
  },
  strengthValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  strengthBarBg: {
    height: 8,
    backgroundColor: light.backgroudLight,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  strengthHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  strengthHintText: {
    fontSize: 12,
    color: light.textSub,
  },
  tipsContainer: {
    backgroundColor: light.backgroudLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: mainColor,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 14,
    color: mainColor,
    marginRight: 8,
    fontWeight: "bold",
  },
  tipText: {
    fontSize: 13,
    color: light.backgroudAlpha,
  },
})

export default styles;