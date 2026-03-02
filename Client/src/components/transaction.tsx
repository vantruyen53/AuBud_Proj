import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import {styles} from '../assets/styles/homeStyle';
import MaterialIcons from "@react-native-vector-icons/material-icons";

export default function Transaction(props:any) {
  return (
    <TouchableOpacity
        style={styles.transactionCard}
        onPress={()=>props.handleEdit({...props})}
        activeOpacity={1}
    >
        <View style={[styles.transIconBg, {backgroundColor:`rgba(${props.iconColor},0.1)`}]}>
            <MaterialIcons name={props.iconName} size={20} color={`rgb(${props.iconColor})`}/>
        </View>
        <View style={styles.transContent}>
            <Text style={styles.transTitle}>{props.title}</Text>
            <Text style={styles.transSubtitle}>{props.wallet}</Text>
        </View>
        <View style={styles.transAmountCol}>
            <Text style={styles.categoryName}>{props.categoryName}</Text>
            <Text 
                style={[
                    styles.transactionAmountText,
                    { color: props.type === "income" ? '#059669' : '#DC2626' }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {props.showData ? props.amount : "******"}
            </Text>
        </View>
    </TouchableOpacity>
  )
}