import { StyleSheet } from "react-native";
import { Colors } from "@/src/constants/theme";
const styles = StyleSheet.create({
    container:{
        position:'absolute',
        top:0,
        bottom:0,
        start:0,
        end:0,
        flex:1,
        backgroundColor: 'rgba(26, 18, 18, 0.4)',
        justifyContent:'center',
        alignItems:"center",
    },
    form:{
        padding:12,
        width:250,
        borderRadius:12,
        backgroundColor:'#fff',
    },
    headerText:{
        fontSize:18,
        fontWeight:'700',
        textAlign:'center',
        borderBottomWidth:1,
        borderStyle:'solid',
        borderBottomColor: '#7f7e7e',
        padding:20,
    },
    itemDebt:{
        backgroundColor:'#f7f7f7',
        borderWidth:1,
        borderStyle:'solid',
        borderColor:'#c7c7c7',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-start',
        gap:10,
        borderRadius:12,
        padding:10
    },
    itemDebtAction:{
        backgroundColor:"#e0f9ff",
        borderColor:Colors.light.primary,
    },
    icon:{
        borderRadius:12,
        paddingRight:10,
        padding:8,
    },
    itemText:{
        color:'#9b9da0',
        fontSize:18,
    },
    gridView:{
        padding:20,
        gap:10,
        paddingStart:30,
        paddingEnd:30,
    }
})
export default styles;