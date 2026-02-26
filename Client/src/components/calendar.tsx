import { useState, useMemo } from "react";
import { IDayData } from "@/src/models/IApp";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../assets/styles/calenderStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

export default function Calendar(props:any) {
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  const now = new Date();
  const [viewDate, setViewDate] = useState(now);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarGrid = useMemo(() => {
    const grid: IDayData[] = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push({ day: null, });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const m = viewMonth + 1;

      grid.push({
        day: d,
      });
    }
    return grid;
  }, [viewMonth, viewYear]);

  const handlePrevMonth = () =>
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const handleNextMonth = () =>
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  return (
    <View style={styles.calendarCard}>
      <View style={styles.form}>
        {/* Month Nav */}
        <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
            <MaterialIcons name="navigate-before" size={24} color="#12D0FF" />
            </TouchableOpacity>

            <View style={styles.calendarTitleRow}>
                <Text style={styles.calendarTitle}>
                     {viewMonth + 1}/{viewYear}
                </Text>
            </View>

            <TouchableOpacity onPress={handleNextMonth}>
            <MaterialIcons name="navigate-next" size={24} color="#12D0FF" />
            </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
            <Text
                key={index}
                style={[
                styles.weekDayText,
                (index === 0 || index === 6) && styles.textError,
                ]}
            >
                {day}
            </Text>
            ))}
        </View>

        {/* Grid */}
        <View style={styles.daysGrid}>
            {calendarGrid.map((item, index) => {
            const isSelected = item.day
                ? item.day === parseInt( props.specificTime.d) &&
                viewMonth+1 === parseInt(props.specificTime.m) &&
                viewYear === parseInt(props.specificTime.year)
                : false;
            return (
                <TouchableOpacity
                key={index}
                style={styles.dayCell}
                disabled={!item.day}
                onPress={()=>{props.onPress(viewYear, viewMonth+1, item.day), props.onPressClose()}}
                >
                {item.day !== null && (
                    <>
                    <View
                        style={[
                        styles.dayCircle,
                        isSelected && styles.dayCircleSelected,
                        ]}
                    >
                        <Text
                        style={[
                            styles.dayText,
                            (index % 7 === 0 || index % 7 === 6) &&
                            styles.textError,
                            isSelected && styles.textWhite,
                        ]}
                        >
                        {item.day}
                        </Text>
                    </View>
                    </>
                )}
                </TouchableOpacity>
            );
            })}
        </View>
      </View>
    </View>
  );
}
