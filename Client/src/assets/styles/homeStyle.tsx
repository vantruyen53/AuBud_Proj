import { StyleSheet, Dimensions } from "react-native";
import { Colors, mainColor } from "@/src/constants/theme";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    linearGradient:{
        position: "absolute",
        width: "100%",
        top: 0,
        left: 0,
        height: 260,
        zIndex: -1,
    },
    container: {
      flex: 1,
      backgroundColor: Colors.light.inputBg, // Xanh chủ đạo
      padding: 16,
      paddingBottom:0,
    },
    headerContainer: {
      paddingBottom: 20,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 8,
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },  
    notifacation:{
      position:'relative'
    },
    noteText:{
      position:'absolute',
      width:15,
      height:15,
      textAlign:'center',
      borderRadius:8,
      top:-4,
      right:-4,
      fontSize:8,
      fontWeight:'700',
      color:Colors.light.primary,
      padding:3,
      backgroundColor:'#fff'
    },
    userName: {
      color: mainColor,
      fontWeight: '600',
      fontSize: 20,
    },
    topRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    historyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.light.tabIconSelected,
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
      gap: 6,
    },
    historyText: {
      color: '#fff',
      fontSize: 16,
    },
    accountList: {
      paddingBottom: 10,
    },
    accountItem: {
      alignItems: 'center',
      marginRight: 10,
      borderColor: "#014a5c",
      padding:10
    },
    accountIconWrapper: {
      marginBottom: 6,
    },
    accountIconBg: {
      width: 60,
      height: 60,
      borderRadius: 22,
      backgroundColor: "#f1fcff",
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000', // Đổi shadow sang đen/xám
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    accountName: {
      color: mainColor,
      fontWeight: '700',
      fontSize: 12,
    },
    addAccountBg: {
      width: 60,
      height: 60,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: '#014a5c',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    addAccountText: {
      color: mainColor,
      fontSize: 12,
      fontWeight: '500',
    },
    /* SUMMARY CARD */
    summaryCard: {
      backgroundColor: '#FFF',
      borderRadius: 24,
      padding: 20,
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
    monthSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: '#F8FAFC',
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 12,
    },
    monthDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    monthText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1E293B',
      marginRight: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statItemMain: {
      flex: 1.5,
      alignItems: 'flex-start',
    },
    statValueMain: {
      fontSize: 26,
      fontWeight: '900',
      color: '#1E293B',
      marginBottom: 6,
    },
    rightStatsCol: {
      flex: 1.1,
      alignItems: 'flex-end',
      gap: 14,
    },
    statItemSubRight: {
      alignItems: 'flex-end',
    },
    statValueIncomeSmall: {
      fontSize: 16,
      fontWeight: '800',
      color: '#059669',
      marginBottom: 2,
    },
    statValueExpenseSmall: {
      fontSize: 14,
      fontWeight: '700',
      color: '#DC2626',
      marginBottom: 2,
    },
    statLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statLabel: {
      fontSize: 10,
      color: '#64748B',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    statLabelSmall: {
      fontSize: 8,
      color: '#94A3B8',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    actionCircleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.light.inputBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Common Transactions Header
    transactionsHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: 10,
    },
    recentTransactionsTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.light.textMain,
    },
    seeMoreLink: {
      fontSize: 14,
      color: '#93C5FD',
      fontWeight: '600',
    },
   /* Segment Control */
  segmentControlContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
  
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#dfe0e6',
  },
  transIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transContent: {
    flex: 1,
    paddingRight: 8,
  },
  transTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  transSubtitle: {
    fontSize: 12,
    color: 'rgb(100, 116, 139)',
    lineHeight: 16,
  },
  transAmountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 100,
  },
  categoryName: {
    fontSize: 12,
    color: "#92969c",
    marginBottom: 4,
    fontWeight: '700',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'System',
    letterSpacing: -0.2,
  },

  /* Swipe Actions */
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '85%',
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginRight: 10,
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

  

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 20, 
    backgroundColor: Colors.light.primary, // FAB cũng theo màu Sky Blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyState: {
     alignItems: 'center',
     padding: 20,
  },
  emptyStateText: {
     color: Colors.light.placeholder,
     fontStyle: 'italic',
  }
})

export {styles}