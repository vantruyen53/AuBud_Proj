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
        width:250,
    },
    header:{
        backgroundColor: '#fff',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        gap:20,
        borderTopRightRadius:12,
        borderTopLeftRadius:12,
        padding:20,
        borderBottomWidth:1,
        borderStyle:'solid',
        borderBottomColor: '#7f7e7e',
    },
    headerText:{
        fontSize:18,
        fontWeight:'800',
    },
    headerIcon:{
        color:Colors.light.primary,
        padding:10,
        borderRadius:12,
        backgroundColor:'#12d0ff25'
    },
    gridView:{
        backgroundColor:'#fff',
        padding:20,
        borderBottomRightRadius:12,
        borderBottomLeftRadius:12,
        gap:10,
        paddingStart:30,
        paddingEnd:30,
    },
    itemYear:{
        backgroundColor:'#efefef',
        borderWidth:1,
        borderStyle:'solid',
        borderColor:'#9b9da0',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:10,
        borderRadius:12,
        paddingTop:20,
        paddingBottom:20,
    },
    itemYearAction:{
        backgroundColor:Colors.light.primary,
        borderColor:Colors.light.primary,
    },
    yearSelected:{  
        color:'#fff'
    },
    itemText:{
        color:'#9b9da0',
        fontSize:20,
    },
    itemTextAction:{
        color:'#FFF',
        fontSize:20,
    },
    
})

export default styles;