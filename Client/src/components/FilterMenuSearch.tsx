import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

const FILTER_OPTIONS = [
  { key: "title", label: "Title", icon: "title" },
  { key: "category", label: "Category", icon: "category" },
  { key: "amount", label: "Amount", icon: "attach-money" },
];

interface FilterMenuProps {
  visible: boolean;
  selected: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

export default function FilterMenu({ visible, selected, onSelect, onClose }: FilterMenuProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <Animated.View style={[styles.menu, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Header */}
        <View style={styles.menuHeader}>
          <Text style={styles.menuHeaderText}>Filter by</Text>
        </View>

        <View style={styles.divider} />

        {/* Options */}
        {FILTER_OPTIONS.map((opt, index) => {
          const isSelected = selected === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.menuItem, isSelected && styles.menuItemSelected]}
              onPress={() => { onSelect(opt.key); onClose(); }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                  <MaterialIcons
                    name={opt.icon as any}
                    size={15}
                    color={isSelected ? "#12D0FF" : "#94a3b8"}
                  />
                </View>
                <Text style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>
                  {opt.label}
                </Text>
              </View>

              {isSelected && (
                <View style={styles.checkWrapper}>
                  <MaterialIcons name="check" size={14} color="#12D0FF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 999,
  },
  menu: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: 200,
    paddingVertical: 6,
    shadowColor: "#12D0FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 6,
    marginVertical: 2,
    borderRadius: 10,
  },
  menuItemSelected: {
    backgroundColor: "#12D0FF10",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperSelected: {
    backgroundColor: "#12D0FF15",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  menuItemTextSelected: {
    color: "#12D0FF",
    fontWeight: "600",
  },
  checkWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#12D0FF15",
    justifyContent: "center",
    alignItems: "center",
  },
});