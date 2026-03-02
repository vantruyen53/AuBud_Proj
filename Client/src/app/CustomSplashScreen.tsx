import { View, Text, Image } from "react-native";
import styles from "../assets/styles/splashStyle";
import { useProvider } from "../hooks/useProvider";
import { useNavigation, StackActions } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";

export default function CustomSplashScreen() {
  const { isAuthenticated, isLoading } = useProvider();
  const navigation = useNavigation();
  const splashText = "AuuBud";

  const [typedText, setTypedText] = useState("");
  const [animationDone, setAnimationDone] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);
  
  const charIndex = useRef(0);

  // Hiệu ứng đánh chữ
  useEffect(() => {
    console.log("[Splash] Hiệu ứng đánh chữ bắt đầu");
    const speed = 120;
    const interval = setInterval(() => {
      if (charIndex.current < splashText.length) {
        setTypedText((prev) => prev + splashText.charAt(charIndex.current));
        charIndex.current++;
      } else {
        console.log("[Splash] Hiệu ứng đánh chữ hoàn thành");
        setAnimationDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, []);

  // Đợi tối thiểu 1.5 giây
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("[Splash] Đã đủ thời gian tối thiểu (1.5s)");
      setTimeElapsed(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  // Lắng nghe sự thay đổi của cả 3 điều kiện để điều hướng
  useEffect(() => {
    const status = `animation: ${animationDone}, time: ${timeElapsed}, loading: ${isLoading}`;
    console.log("[Splash] Trạng thái hiện tại:", status);

    if (animationDone && timeElapsed && !isLoading) {
      console.log("[Splash] CHUYỂN TRANG! Auth:", isAuthenticated);
      if (isAuthenticated) {
        navigation.dispatch(StackActions.replace("LayoutTabs"));
      } else {
        navigation.dispatch(StackActions.replace("LayoutAuth"));
      }
    } else {
      console.log("[Splash] Vẫn đang chờ điều kiện...");
    }
  }, [animationDone, timeElapsed, isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <Image
        style={styles.splashLogo}
        source={require("../assets/images/welcome.png")}
        resizeMode="contain"
      />
      <Text style={styles.splashText}>{typedText}</Text>
    </View>
  );
}