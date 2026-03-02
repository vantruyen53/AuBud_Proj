import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import {BarChartProps} from '@/src/models/IApp';

const BarChart: React.FC<BarChartProps> = (props:any) => {
  const diff = props.income - props.sending;
  const maxVal = Math.max(props.sending, props.income, 1);
  
  // 1. Tạo 2 giá trị khởi tạo cho Animation (từ 0 đến 1)
  const animSending = useRef(new Animated.Value(0)).current;
  const animIncome = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 2. Chạy hiệu ứng song song khi component mount
    Animated.parallel([
      Animated.timing(animSending, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp), // Hiệu ứng mượt ở đoạn cuối
        useNativeDriver: false, // Chiều cao không hỗ trợ Native Driver
      }),
      Animated.timing(animIncome, {
        toValue: 1,
        duration: 1000,
        delay: 200, // Cột xanh mọc sau một chút cho sinh động
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
    ]).start();
  }, [props.sending, props.income]);

  const formatCurrency = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  // 3. Nội suy giá trị từ animation ra phần trăm chiều cao
  const sendingHeight = animSending.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${(props.sending / maxVal) * 100}%`],
  });

  const incomeHeight = animIncome.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${(props.income / maxVal) * 100}%`],
  });

  return (
    <View style={styles.container}>
      {/* Box bên trái: Cột Bar mọc lên */}
      <View style={styles.barWrapper}>
        <View style={styles.barTrack}>
          <Animated.View 
            style={[styles.bar, { height: sendingHeight, backgroundColor: '#EF4444' }]} 
          />
          <Text style={styles.barLabel}>Sen</Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View 
            style={[styles.bar, { height: incomeHeight, backgroundColor: '#10B981' }]} 
          />
          <Text style={styles.barLabel}>Inc</Text>
        </View>
      </View>

      {/* Box bên phải: Thông tin chi tiết */}
      <View style={styles.infoWrapper}>
        <View style={styles.dataRow}>
          <Text style={styles.labelSmall}>SENDING</Text>
          <Text style={[styles.amountBig, { color: '#EF4444' }]}>{formatCurrency(props.sending)}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.labelSmall}>INCOME</Text>
          <Text style={[styles.amountBig, { color: '#10B981' }]}>{formatCurrency(props.income)}</Text>
        </View>

        <View style={[styles.dataRow, styles.borderTop]}>
          <Text style={styles.labelSmall}>DIFFERENCE</Text>
          <Text style={[styles.amountBig, { color: '#1E293B' }]}>
            {diff > 0 ? "+" : ""}{formatCurrency(diff)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center'
  },
  barWrapper: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: 14,
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  barTrack: {
    height: '100%',
    width: 28,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    // Hiệu ứng đổ bóng cho cột để trông 3D hơn
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  infoWrapper: {
    flex: 1,
    paddingLeft: 24,
    gap: 16,
  },
  dataRow: {
    flexDirection: 'column',
  },
  labelSmall: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  amountBig: {
    fontSize: 20,
    fontWeight: '900',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  }
});

export default BarChart;