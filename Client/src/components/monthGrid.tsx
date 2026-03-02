import { Text, View, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../assets/styles/monthGridStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

export default function MonthGrid(props: any) {
  const data = [
    { id: "1", title: "Jan" },
    { id: "2", title: "Feb" },
    { id: "3", title: "Mar" },
    { id: "4", title: "Apr" },
    { id: "5", title: "May" },
    { id: "6", title: "Jun" },
    { id: "7", title: "Jul" },
    { id: "8", title: "Aug" },
    { id: "9", title: "Sep" },
    { id: "10", title: "Oct" },
    { id: "11", title: "Nov" },
    { id: "12", title: "Dec" },
  ];

  const renderItem = ({ item }: { item: { id: string; title: string } }) => {
    const isSelected = props.specificTime.y === props.yearShown.toString() && props.specificTime.m===item.id;
    return (
        <TouchableOpacity
        onPress={() => props.selecteMonth(item.id)}
        style={
            isSelected
            ? styles.itemContainerActive
            : styles.itemContainer}
        >
        <Text
            style={
            isSelected
                ? styles.itemTextActive
                : styles.itemText
            }
        >
            {item.title}
        </Text>
        </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.header}>
          <MaterialIcons
            style={styles.headerIcon}
            onPress={props.preYear}
            name="navigate-before"
            size={22}
          />
          <Text style={styles.headerText}>{props.yearShown}</Text>
          <MaterialIcons
            style={styles.headerIcon}
            onPress={props.nexYear}
            name="navigate-next"
            size={22}
          />
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={4}
          contentContainerStyle={styles.gridView}
        />
      </View>
    </SafeAreaView>
  );
}
