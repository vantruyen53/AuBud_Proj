import {IStatisticCategory} from "../models/IApp";
import {View,Text,TouchableOpacity, StyleSheet,Animated,Easing} from "react-native";
import React, { useEffect, useRef, useState,useMemo } from "react";
import { formatShortCurrency, convertDateFormat } from "../utils/format";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from "@/src/constants/theme";

interface Props {
  data: any[];
  type?: 'sending' | 'income';
  showLabel: boolean;
  size?:number
}

const CategoryPieChart: React.FC<Props> = ({ data, type, showLabel, size=150 }) => {
  // Cấu hình thông số biểu đồ
  const strokeWidth = 18;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  // Bảng màu sắc cho các Category
  const colors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  const getProgressBarColor = (percentage: number) => {
      if (percentage >= 100) return Colors.light.error;
      if (percentage > 80) return Colors.light.warning;
      if(percentage>60) return Colors.light.success;
      return Colors.light.primary; 
  };

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // KIỂM TRA: Nếu là dữ liệu Budget (có trường balance) và không showLabel
    if (!showLabel && 'balance' in data[0]) {
      const totalGoal = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      const totalSpent = data.reduce((sum, item) => sum + (item.balance || 0), 0);
      const remaining = totalGoal - totalSpent;

      const progessPercen = (totalSpent/totalGoal)*100
      const processCol = getProgressBarColor(progessPercen)
      
      return [
        { id: 'spent', val: totalSpent, name: 'Spent', color: processCol },
        { id: 'rem', val: remaining > 0 ? remaining : 0, name: 'Remaining' }
      ];
    }

    // Nếu là dữ liệu Statistic bình thường
    const filtered = type ? data.filter(item => item.type === type) : data;
    return filtered.map((item, index) => ({
      id: item.id || String(index),
      val: item.totalAmount || 0, // Chấp nhận cả 2 cách viết
      name: item.categoryName || item.category?.name || 'Unknown',
      color: colors[index % colors.length]
    }));
  }, [data, type, showLabel]);

  // 1. Lọc dữ liệu theo loại và tính tổng
  const totalSum = useMemo(() => {
    const sum = processedData.reduce((acc, curr) => acc + curr.val, 0);
    return sum === 0 ? 1 : sum; // Tránh chia cho 0 gây NaN
  }, [processedData]);

  // Hàm format tiền gọn (reuse helper của bạn)
  const formatMoney = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  const spentPercentage = useMemo(() => {
    if (data.length > 0 && 'balance' in data[0]) {
      const totalGoal = data.reduce((sum, item) => sum + item.totalAmount, 0);
      const totalSpent = data.reduce((sum, item) => sum + (item.balance), 0);
      return ((totalSpent / totalGoal) * 100).toFixed(0);
    }
    return null;
  }, [data]);

  let currentOffset = 0;

  return (
    <View style={[
      styles.cardContainer, 
      type &&processedData && processedData.length > 6 ? { flexDirection: 'column-reverse' }: { flexDirection: 'row' },
      type && styles.backgroundShadow
    ]}>
    {/* PHẦN DANH SÁCH NHÃN */}
    {showLabel  && <View style={[
      styles.legendWrapper, 
       processedData && processedData.length > 6 ? styles.wrapLegendContainer : {width:170}
    ]}>
      {processedData && processedData.map((item, index) => (
        <View 
          key={item.id} 
          style={[
            styles.legendItem, 
            processedData && processedData.length > 6 ? styles.legendItemHalf : null // Chia 2 cột nếu nhiều data
          ]}
        >
          <View style={[styles.colorDot, { backgroundColor: colors[index % colors.length] }]} />
          <View style={styles.legendTextWrapper}>
            <View style={styles.categoryLable}>
                <Text style={styles.categoryName} numberOfLines={1}>{item.name }</Text>
                <Text style={styles.categoryPersen}>
                {`(${((item.val/totalSum)*100).toFixed(2)}%)`}
                </Text>
            </View>
            <Text style={styles.categoryAmount}>{formatMoney(item.val)}</Text>
          </View>
        </View>
      ))}
    </View>}

      {/* PHẦN PHẢI: DONUT CHART */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle cx={center} cy={center} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
            
            {processedData.map((item) => {
              const percentage = item.val / totalSum;
              const strokeDashoffset = circumference - (percentage * circumference);
              const rotation = (currentOffset / totalSum) * 360;
              currentOffset += item.val;

              return (
                <Circle
                  key={item.id}
                  cx={center} cy={center} r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset} // Bảo vệ NaN
                  transform={`rotate(${isNaN(rotation) ? 0 : rotation}, ${center}, ${center})`} // Bảo vệ NaN
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>
        
        {/* Nội dung ở tâm vòng tròn */}
        <View style={styles.centerTextWrapper}>
          <Text style={[styles.totalLabel, spentPercentage?{fontSize:13}:{fontSize:10}]}>{spentPercentage ? 'Total Spent' : 'Total'}</Text>
          <Text style={[styles.totalValue,spentPercentage?{fontSize:20}:{fontSize:16}]} numberOfLines={1}>
            {spentPercentage ? `${spentPercentage}%`: totalSum > 1000000 
              ? (totalSum / 1000000).toFixed(1) + "M" 
              : formatMoney(totalSum).replace(" ₫", "")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  backgroundShadow:{
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // Shadow cho Android
    elevation: 4,
  },
  legendWrapper: {
    paddingRight: 10,
  },
  wrapLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%', // Ép chiếm hết chiều ngang card
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 8,
  },
  legendItemHalf: {
    width: '50%', // QUAN TRỌNG: Chia làm 2 cột để chữ có không gian hiển thị
    paddingRight: 5,
  },
  legendTextWrapper: {
    flex: 1,
  },
  categoryLable:{
    flexDirection:'row', 
    gap:5, 
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  categoryPersen:{
    fontSize: 13,
    fontWeight: '500',
    color: '#7089ad',
  },
  categoryAmount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chartWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerTextWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%', // Giới hạn độ rộng để text không tràn ra ngoài vòng tròn
  },
  totalLabel: {
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  }
});

export default CategoryPieChart;