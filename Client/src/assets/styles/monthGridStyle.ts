import { StyleSheet } from "react-native";
import { Colors} from "@/src/constants/theme";

const styles = StyleSheet.create({
    container:{
        position:'absolute',
        top:0,
        bottom:0,
        start:0,
        end:0,
        flex:1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent:'center',
        alignItems:"center",
    },
    form:{
        padding:12,
        width:350,
    },
    header:{
        backgroundColor: Colors.light.primary,
        flexDirection:'row',
        justifyContent:'space-around',
        borderTopRightRadius:12,
        borderTopLeftRadius:12,
        padding:20,
    },
    headerText:{
        color:'#fff',
        fontSize:18,
        fontWeight:'700',
    },
    headerIcon:{
        color:'#fff',
    },
    gridView: {
        backgroundColor:'#fff',
        padding:20,
        borderBottomRightRadius:12,
        borderBottomLeftRadius:12,
        gap:5,
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 72, 
        minWidth:50,
    },
    itemContainerActive:{
        color:"#fff",
        backgroundColor:Colors.light.primary,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 72, 
        minWidth:50,
        borderRadius: 50,
    },
    itemText: {
        fontSize: 16,
    },
    itemTextActive: {
        color:"#fff",
        backgroundColor:Colors.light.primary,
        fontSize: 16,
    },
})

export default styles