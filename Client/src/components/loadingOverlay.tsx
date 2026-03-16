import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ImageSourcePropType } from 'react-native';

interface LoadingLogoProps {
  logoSource: ImageSourcePropType;
  size?: number;
}

const LoadingLogo: React.FC<LoadingLogoProps> = ({ logoSource, size = 100 }) => {
  // Khởi tạo giá trị xoay (0 là ở giữa)
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tạo chuỗi chuyển động: Giữa -> Trái -> Phải -> Giữa
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          // Xoay sang trái
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Xoay sang phải
          Animated.timing(rotateValue, {
            toValue: -1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Về lại giữa
          Animated.timing(rotateValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [rotateValue]);

  // Map giá trị từ -1, 0, 1 sang độ (degrees)
  // -15deg sang trái, 15deg sang phải
  const rotation = rotateValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={logoSource}
        style={[
          { width: size, height: size },
          { transform: [{ rotate: rotation }] },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
});

export default LoadingLogo;