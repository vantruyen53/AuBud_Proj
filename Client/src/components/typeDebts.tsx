import { IDebtMaster } from "../models/IApp";
import { Text, View, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../assets/styles/typeDebts";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";

export default function TypeDebt(props:any) {
    const data= [
        {type:'loan_to'},
        {type:'loan_from'},
        {type:'repay_to'},
        {type:'repay_from'},
    ];

    const renderItem=({item}:{item:{type:string}})=>{
        const isSelected = props.isSelected===item.type;
        const itemName=(type:string)=>{
            switch(type){
                case 'loan_to':
                    return 'cash-fast'
                case 'loan_from':
                    return 'hand-coin'
                case 'repay_to':
                    return 'cash-check'
                case 'reay_from':
                    return 'cash-refund'
                default:
                    return 'plus-minus'
                
            }
        }
        const iconColor=(type:string)=>{
            switch(type){
                case 'loan_to':
                    return '240, 40, 0'
                case 'loan_from':
                    return '0, 200, 80'
                case 'repay_to':
                    return '100, 116, 139'
                case 'repay_from':
                    return '255, 193, 7'
                default:
                    return '255, 255, 255'
                
            }
        }
        return(
            <TouchableOpacity
                onPress={()=>props.onSelecte({type:item.type})}
                style={[styles.itemDebt, isSelected? styles.itemDebtAction: null]}
            >
                <View style={[styles.icon, {backgroundColor:`rgba(${iconColor(item.type)},0.2)`}]}>
                    <MaterialDesignIcons
                        size={22}
                        name={itemName(item.type)}
                        color={`rgb(${iconColor(item.type)})`}
                    />
                </View>
                <Text  style={styles.itemText}>
                    {item.type==="loan_to"? "Loan to":
                        item.type==="loan_from"?"Loan from":
                        item.type==="repay_to"?"Repay to":
                        item.type==="repay_from"?"Repay from": null
                    }
                </Text>
            </TouchableOpacity>
        )
    }
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.form}>
            <Text style={styles.headerText}>Selecte type of Debt</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.type}
                renderItem={renderItem}
                numColumns={1}
                contentContainerStyle={styles.gridView}
            />
        </View>
    </SafeAreaView>
  )
}