import { View, Text, Image } from "react-native";
import styles from "../assets/styles/splashStyle";
import { useProvider } from "../hooks/useProvider";
import { useNavigation, StackActions } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";

export default function CustomSplashScreen() {
  const { isAuthenticated, isLoading} = useProvider();
  const navigation = useNavigation();
  const splashText = "AuuBud";

  const [typedText, setTypedText] = useState("");
  const charIndex = useRef(0);
  const isAnimationDone = useRef(false);
  // Ref để kiểm tra xem đã đủ 2 giây chưa
  const isTimeElapsed = useRef(false);

  useEffect(() => {
    const speed = 120;
    const interval = setInterval(() => {
      if (charIndex.current <= splashText.length) {
        setTypedText((prev) => prev + splashText.charAt(charIndex.current));
        charIndex.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    // Tối thiểu 1.5 giây
    const timeout = setTimeout(() => {
      isTimeElapsed.current = true;
      checkAndNavigate();
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      checkAndNavigate();
    }
  }, [isLoading]);

  // Hàm kiểm tra và điều hướng
  const checkAndNavigate = () => {
    // Đủ 3 điều kiện: animation xong + thời gian tối thiểu + auth check xong
    if (!isAnimationDone.current) return;
    if (!isTimeElapsed.current) return;
    if (isLoading) return;

    if (isAuthenticated) {
      navigation.dispatch(StackActions.replace("LayoutTabs"));
    } else {
      navigation.dispatch(StackActions.replace("LayoutAuth"));
    }
  };

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