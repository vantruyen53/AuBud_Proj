import { Text, View, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../assets/styles/yearListStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";

export default function YearList(props:any) {
    const currYear = new Date().getFullYear();

    const data = [
    { id: "1", content: `${currYear-3}` },
    { id: "2", content: `${currYear-2}` },
    { id: "3", content: `${currYear-1}`},
    { id: "4", content: `${currYear}` }
  ];

  const renderItem = ({ item }: { item: { id: string; content: string } }) =>{
    const isSelected = props.specificTime.y===item.content;
    return(
        <TouchableOpacity
            onPress={() => props.selectYear(item.content)}
            style={[styles.itemYear, isSelected? styles.itemYearAction: null]}
        >
            {isSelected && <MaterialIcons name="check-circle" size={22} style={styles.yearSelected}/>}
            <Text style={[styles.itemText, isSelected? styles.itemTextAction: null]}>
                {item.content}
            </Text> 
        </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.form}>
            <View style={styles.header}>
                <MaterialIcons name="calendar-today" size={24}  style={styles.headerIcon}/>
                <Text style={styles.headerText}>Year</Text>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={1}
                contentContainerStyle={styles.gridView}
            />
        </View>
    </SafeAreaView>
  )
}