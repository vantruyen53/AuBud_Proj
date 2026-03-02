import { IStatisticDate } from "../models/IApp";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useRef, useState,useMemo } from "react";
import { formatShortCurrency, convertDateFormat } from "../utils/format";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { genereteWeekRange, PaginationData } from "../utils/helper";

interface Props {
  data: IStatisticDate[];
  type: 'sending' | 'income';
  timeLine: 'Date' | 'Month' | 'Year';
  month:number;
  year: number;
}

const HorizontalBar: React.FC<Props> = ({ data, type, timeLine, month, year}) => {
  const itemsPerPage = 7;
  const weekRangeIndex = useMemo(() => genereteWeekRange(month, year), [month, year]);

  const [pageNumber, setPageNumber]=useState<number>(1);
  const animBar = useRef(new Animated.Value(0)).current;

  // Reset trang về 1 nếu người dùng đổi tháng/năm hoặc loại timeline
  useEffect(() => {
    setPageNumber(1);
  }, [month, year, timeLine]);

  const currentData = useMemo(() => {
    if (timeLine !== 'Month') return data;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, pageNumber, timeLine]);

  const currentWeek = weekRangeIndex[pageNumber - 1] || weekRangeIndex[0];

  const getMaxValue = () => {
    if (!currentData || currentData.length === 0) return 1;
    const values = currentData.map(item => type === 'sending' ? item.sending : item.income);
    const max = Math.max(...values);
    return max <= 0 ? 1 : max;
  };

  const maxValue = getMaxValue();

  useEffect(() => {
    animBar.setValue(0);
    Animated.timing(animBar, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false, // Phải để false vì liên quan đến width
    }).start(); // QUAN TRỌNG: Phải có .start()
  }, [currentData, type]);

  return (
    <View style={styles.chartCard}>
      {currentData.map((item, i) => {
        const currentVal = type === 'sending' ? item.sending : item.income;
        const barWidth = animBar.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', `${(currentVal / maxValue) * 100}%`]
        });

        return (
          <View key={item.id || i} style={styles.chartContent}>
            <View style={styles.timeYAxis}>
              <Text style={styles.dateText}>
                {timeLine !== "Year" ? convertDateFormat(item.date, false) : item.date}
              </Text>
            </View>

            <View style={styles.barArea}>
              <Animated.View 
                style={[
                  styles.barFill, 
                  { 
                    width: barWidth, 
                    backgroundColor: type === 'sending' ? '#EF4444' : '#10B981' 
                  }
                ]} 
              />
            </View>

            <View style={styles.amountArea}>
              <Text style={styles.amountText}>{formatShortCurrency(currentVal)}</Text>
            </View>
          </View>
        );
      })}

      {timeLine === 'Month' && (
        <View style={styles.pagination}>
          <TouchableOpacity 
            disabled={pageNumber === 1} 
            onPress={() => setPageNumber(prev => prev - 1)} 
            style={styles.navBtn}
          >
            <MaterialIcons 
              name='chevron-left' 
              size={24} 
              color={pageNumber === 1 ? '#D1D5DB' : '#6B7280'}
            />
          </TouchableOpacity>
          
          <Text style={styles.rangeText}>
            {`Day ${currentWeek?.startW || ''} - ${currentWeek?.endW || ''}`}
          </Text>
          
          <TouchableOpacity 
            disabled={pageNumber >= weekRangeIndex.length} 
            onPress={() => setPageNumber(prev => prev + 1)} 
            style={styles.navBtn}
          >
            <MaterialIcons 
              name='chevron-right' 
              size={24} 
              color={pageNumber >= weekRangeIndex.length ? '#D1D5DB' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HorizontalBar;

const styles = StyleSheet.create({
  // Chart Card
  chartCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  chartContent: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  timeYAxis: {
    width: 50,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500'
  },
  barArea: {
    flex: 1, 
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  amountArea: {
    width: 45,
    alignItems: 'flex-end'
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  navBtn: {
    padding: 5,
  },
  rangeText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#475569',
    fontWeight: 'bold'
  }
});
