import { View, Text, Image } from "react-native";
import styles from "../assets/styles/splashStyle";
import { useProvider } from "../hooks/useProvider";
import { useNavigation, StackActions } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";

export default function CustomSplashScreen() {
  const { isAuthenticated, isLoading } = useProvider();
  const navigation = useNavigation();
  const splashText = "AuBud";

  const [typedText, setTypedText] = useState("");
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [isTimeElapsed, setIsTimeElapsed] = useState(false);

  // 1. Logic chạy animation chữ
  useEffect(() => {
    let charIndex = 0;
    const speed = 120;
    const interval = setInterval(() => {
      if (charIndex < splashText.length) {
        setTypedText(splashText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsAnimationDone(true); // Cập nhật state để trigger re-render
      }
    }, speed);

    // 2. Logic đảm bảo thời gian chờ tối thiểu 2s
    const timeout = setTimeout(() => {
      setIsTimeElapsed(true); // Cập nhật state để trigger re-render
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // 3. Effect theo dõi sự thay đổi của cả 3 điều kiện
  useEffect(() => {
    if (isAnimationDone && isTimeElapsed && !isLoading) {
      if (isAuthenticated) {
        navigation.dispatch(StackActions.replace("LayoutTabs"));
      } else {
        navigation.dispatch(StackActions.replace("LayoutAuth"));
      }
    }
  }, [isAnimationDone, isTimeElapsed, isLoading, isAuthenticated]);

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