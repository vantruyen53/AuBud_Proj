import React, { useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Colors, Fonts } from "@/src/constants/theme";
import { convertDateFormat, formatCurrency } from "@/src/utils/format";

interface TransactionItemProps {
  id:string
  amount: string;
  date: string;
  wallet: string;
  walletId:string,//bankId or cashId,,, not debtId or savingId
  note?: string;
  type:string, //repay_to or repay_from
  onDelete: (id:string, amount:string, walletId:string, type:string) => void;
}

export default function TransactionItem({
  amount, date, wallet, note, onDelete,id,walletId,type
}: TransactionItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        {/* Accent bar */}
        <View style={styles.accentBar} />

        {/* Body */}
        <View style={styles.body}>

          {/* Top row */}
          <View style={styles.topRow}>
            <View style={styles.walletChip}>
              <MaterialIcons name="account-balance-wallet" size={13} color={Colors.light.primary} />
              <Text style={styles.walletText} numberOfLines={1}>{wallet}</Text>
            </View>
            <TouchableOpacity
              onPress={()=>onDelete(id, amount,walletId, type)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteBtn}
            >
              <MaterialIcons name="delete-outline" size={18} color="#ff0000" />
            </TouchableOpacity>
          </View>

          {/* Amount — hero element */}
          <Text style={styles.amount}>
            {formatCurrency(parseInt(amount), { absolute: true })}
          </Text>

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            <View style={styles.dateRow}>
              <MaterialIcons name="schedule" size={11} color="#aaa" />
              <Text style={styles.date}>
                {convertDateFormat(date.split(" ")[0], true)}
              </Text>
            </View>
            {note && (
              <>
                <View style={styles.dot}/>
                <Text style={styles.note} numberOfLines={1}>{note}</Text>
              </>
            )}
          </View>

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop:5,
    paddingBottom:5,
    borderBottomColor:'#ebebeb',
    borderBottomWidth:1,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    backgroundColor: Colors.light.primary,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    maxWidth: "75%",
  },
  walletText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.primary,
    fontFamily: Fonts.rounded,
  },
  deleteBtn: {
    padding: 3,
    backgroundColor:'#ff000010',
    borderRadius:6,
  },
  amount: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.textMain,
    fontFamily: Fonts.rounded,
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight:3,
  },
  date: {
    fontSize: 11,
    color: "#b1b1b1",
    fontWeight: "500",
  },
  dot: {
    width:3,
    height:3,
    borderRadius:50,
    backgroundColor: "#6c6969",
    marginRight:3,
  },
  note: {
    fontSize: 11,
    color: "#020101",
    fontStyle: "italic",
    flex: 1,
  },
});