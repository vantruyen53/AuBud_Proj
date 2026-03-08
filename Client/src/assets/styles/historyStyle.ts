import { StyleSheet, Dimensions } from "react-native";
import { mainColor, Colors,  } from "@/src/constants/theme";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: Colors.light.inputBg,
        // padding: 16,
        paddingBottom:0,
        position:'relative'
    },

    // Header
    header: {
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom:10,
         backgroundColor:"#12D0FF",
    },
    backButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        textAlign:"center",
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    searchButton: {
        width: 40,
    },
    formSearch:{
        flex:1,
        backgroundColor:"#f9fdfe",
        borderWidth:1,
        borderStyle:"solid",
        borderColor: Colors.light.border,
        flexDirection: "row",
        alignItems: "center",
        padding:5,
        borderRadius:10
    },
    contentSearch:{
        flex:1,
        padding:5,
        fontSize: 15,
    },
    clearFrom:{
        width:20,
        height:20,
        borderRadius: 20,
        backgroundColor: "#e0f5ffe0",
        justifyContent: "center",
        alignItems: "center",
    },
    filterSearch:{
        marginStart:5
    },

    containerList:{
      flex:1,
      padding:16,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      marginTop: -30,
      paddingBottom: 0,
      paddingTop:0,
      overflow:'hidden',
      backgroundColor: "#fff",
    },

    // selecte time 
    selecteTime:{
      marginTop:20,
      gap:10,
      alignItems: 'center', 
    },
    tabsSelectTime:{
      flexDirection:'row', 
      gap:5,
      borderWidth:4,
      backgroundColor: "#089abf",
      borderColor:"#089abf",
      borderRadius:10,
    },
    selecteTimeBTn:{
        borderRadius:10,
        padding:7,
        flexDirection:'row',
        gap:7,
        width:120,
        justifyContent:'center',
    },
    selecteTimeText:{
        fontWeight:"600",
        
    },
    placeHolder:{
        flex:1,
    },

    //summary card
    summaryCard: {
      backgroundColor: '#FFF',
      borderRadius: 24,
      padding: 20,
      marginTop: 20,
      marginBottom: 24,
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 8,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.light.border,
    },
    linearGradient:{
        position: "absolute",
        width: "100%",
        top: 0,
        left: 0,
        height: 260,
        zIndex: -1,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statItemMain:{
        flex: 1.5,
      alignItems: 'flex-start',
    },
    statValueMain:{
        fontSize: 26,
      fontWeight: '900',
      color: '#F2DD00',
      marginBottom: 6,
    },
    statLabelRow:{
        flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statIcon:{
        backgroundColor: '#F2DD00',
        borderRadius:50,
        padding:2,
    },
    statLabel:{
        fontSize: 12,
      color: '#F2DD00',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    rightStatsCol:{
        flex: 1.1,
      alignItems: 'flex-end',
      gap: 14,
    },
    statItemSubRight:{
        alignItems: 'flex-end',
    },
    statValueIncomeSmall:{
        fontSize: 16,
      fontWeight: '800',
      color: '#059669',
      marginBottom: 2,
    },
    statLabelSmall:{
        fontSize: 8,
      color: '#94A3B8',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValueExpenseSmall:{
        fontSize: 14,
      fontWeight: '700',
      color: '#DC2626',
      marginBottom: 2,
    },

    // Segment Control (Chi/Thu) 
    segmentControlContainer:{
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    
  },
  segmentButtonActive: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSub,
  },
  segmentTextActive: {
    color: '#FFF',
  },
  noTransactionsText: {
    fontSize: 14,
    color: Colors.light.placeholder,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },

//   Delete& edit transaction item 
  hiddenContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    deleteAction: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '85%',
      alignSelf: 'flex-end',
      borderRadius: 20,
      marginRight: 5,
      marginBottom: 12,
    },
  deleteActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

})

export {styles}