import { StyleSheet, Dimensions } from "react-native";
import { mainColor, Colors,  } from "@/src/constants/theme";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.inputBg,
      paddingBottom:0,
      position:'relative',
    },

    // Header
    header: {
      paddingBottom: 20,
      flexDirection:'row',
      alignItems:"center",
      justifyContent:'space-between'
    },
    backButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    typeAction:{
      flexDirection:'row',
      alignItems:"center",
      justifyContent:'space-around',
      gap:10,
    },
    typeItem:{
        borderRadius:12,
        flexDirection:"row",
        gap:5,
        padding:10,
    },
    typeItemAction:{
        backgroundColor: Colors.light.tabIconSelected,
    },
    typeItemIcon:{
        color:Colors.light.tabIconSelected,
    },
    typeItemIconAction:{
        color: '#fff'
    },
    typeTex:{
        color: '#fff',
        fontSize:16,
    },

    // form 
    form:{
        backgroundColor:'#fff',
        borderRadius:12,
        marginBottom:10,
        padding:15,
        gap:20,
    },
    detailCat:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderBottomColor:'#eaeaea',
        borderBottomWidth:1,
        paddingVertical:10,
    },
    detailCatText:{
        fontWeight:'400',
        fontSize:18,
        marginBottom:5,
        color:'#000'
    },
    detailCatClear:{
        width:20,
        height:20,
        borderRadius: 20,
        backgroundColor: "#e0f5ffe0",
        justifyContent: "center",
        alignItems: "center",
    },
    amountText:{
        textAlign:'center',
        fontWeight:'500',
        fontSize:18,
        color:"#7e7e7e",
    },
    amountInput:{
        textAlign:'center',
        padding:10,
        paddingTop:0,
        fontSize:20,
        fontWeight:'700',
    },


    // category 
    gridContainer:{
        flex:1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    catItem: {
        flex:1,
        alignItems: 'center',
        padding:10,
    },
    catIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    catIconBgSelected: {
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    catName: {
        fontSize: 12,
        textAlign: 'center',
        color: Colors.light.textMain,
    },
    catNameSelected: {
        fontWeight: '700',
        color: Colors.light.primary,
    },
    moreBtn:{
        flexDirection:"row",
        justifyContent:'flex-end',
        alignItems:'center',
        gap:5,
    },
    moreText:{
        fontSize:12,
        color: Colors.light.tabIconSelected,
        fontWeight:'500',
    },

    //Infor
    inforInput:{
        flexDirection:"row", 
        gap:10,
        alignItems:'center',
    },
    icon:{
        borderRadius:8,
        marginRight: 5,
    },
    walletName:{
        fontWeight:'400',
        fontSize:18,
        marginBottom:5
    },
    placeHolderWallet:{
        fontWeight:'400',
        fontSize:18,
        marginBottom:5,
        color:"#dddddd"
    },

    // time 
    selecteTimeText:{
        fontWeight:"500",
        fontSize:16,
    },

    saveBtn:{
        flex:1,
        padding:10,
        backgroundColor:Colors.light.primary,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:12,
    },
    saveText:{
        fontSize:20,
        color:'#fff',
        fontWeight:'700'
    }

})
export default styles