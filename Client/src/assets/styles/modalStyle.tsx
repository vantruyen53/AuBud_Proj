import { StyleSheet } from "react-native";
import { Colors} from "@/src/constants/theme";

const styles = StyleSheet.create({
    /* Modal Styles */
    noTransactionsText: {
      fontSize: 14,
      color: Colors.light.placeholder,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 20,
    },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex:11,
      },
      modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
      },
      modalHeader: {
        flexDirection:'row', 
        justifyContent: 'space-between',
        alignItems:'center',
        marginBottom:10
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
      },
      headerCat:{
        flexDirection:'row',
        gap:10,
        alignItems:'center',
      },
      headerCatText:{
        fontSize: 16,
        textAlign: 'center',
        color:Colors.light.primary,
        fontWeight:'600',
      },
      modalForm: {
        marginBottom: 24,
      },
      inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        marginTop: 16,
      },
      input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
      },
      modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 20,
      },
      deleteBtnModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 8,
      },
      deleteBtnModalText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '700',
      },
      saveBtn: {
        flex: 1,
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
      },
      saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
      },
      typeRow: {
        flexDirection: 'row',
        gap: 12,
      },
    typeBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#F8FAFC',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    typeBtnActive: {
      backgroundColor: Colors.light.primary,
      borderColor:  Colors.light.primary,
    },
    typeBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#64748B',
    },
    typeBtnTextActive: {
      color: '#FFF',
    },

    // Select Time 
    ListSelectItem:{
      flexDirection:'row',
      justifyContent:'space-evenly',
      paddingBottom:40,
      paddingStart:40,
      paddingEnd:40,
      backgroundColor:'#fff',
      gap:15,
    },
    selecteTimeBTn:{
      justifyContent:'space-between',
      alignItems:'center',
      gap:10,
      backgroundColor: '#fff',
      borderRadius:10,
     borderWidth:1,
      borderStyle: "solid",
      borderColor: '#c6c6c6',
      padding:10,
      width:70,
      flex:1,
    },
    selecteTimeText:{
      color: Colors.light.placeholder
    },
    selecteTimeIcon:{
      color: Colors.light.placeholder
    },
    selecteTimeActive:{
      flex:1,
      justifyContent:'space-between',
      alignItems:'center',
      gap:10,
      backgroundColor: Colors.light.primary,
      borderRadius:10,
      borderWidth:1,
      borderStyle: "solid",
      borderColor: '#F1F5F9',
      padding:10,
    },
    selecteTimeTextActive:{
      color:"#fff"
    },
    selecteTimeIconActive:{
      color:"#fff"
    },

    // Wallet 
    walletItem:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        borderRadius:12,
        borderWidth:1,
        borderColor:'#F1F5F9',
        padding:10,
        gap:10,
        marginBottom:10,
    },
    walletItemAction:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        borderRadius:12,
        borderWidth:2,
        borderColor:Colors.light.primary,
        backgroundColor:'#f4fdff',
        padding:10,
        marginBottom:10,
    },
    icon:{
        borderRadius:8,
        padding:7,
        backgroundColor:'#05966910',
        marginRight: 10,
        justifyContent:'center',
    },
    walletName:{
        fontWeight:'700',
        fontSize:12,
        marginBottom:5
    },
    balance:{
        fontSize:16,
        fontWeight:'700',
    },


    // list debts 
    addNewInput: {
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: '#f1f5f9', // Màu xám xanh nhẹ hiện đại
      borderWidth: 1,
      borderColor: '#e2e8f0',
      fontSize: 16,
      marginBottom: 15,
      color: '#1e293b',
      flex:1,
    },
    addNewBtn:{
      borderRadius: 12,
      backgroundColor:Colors.light.primary,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
    },
    addNewText:{
      fontSize: 16,
      color:'#fff',
      fontWeight:'600',
    },
    debtItem: {
      flexDirection: 'row',
      padding: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: '#fff', // Nền trắng để nổi bật trên modal xám
      marginBottom: 12,
      // Thêm shadow nhẹ cho iOS & Android
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    debtItemAction: {
      borderWidth: 2,
      borderColor: '#3b82f6', // Thay Colors.light.primary nếu cần
      backgroundColor: '#eff6ff', 
    },
    leftInfor: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Chiếm không gian bên trái
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    nameContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    loanName: {
      fontSize: 12,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    partnerNameText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1e293b',
      marginVertical: 2,
    },
    timeLoan: {
      fontSize: 11,
      color: '#94a3b8',
    },
    rightInforWrapper: {
      alignItems: 'flex-end',
      gap: 4,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    textAmountLabel: {
      fontSize: 10,
      color: '#94a3b8',
      fontWeight: '500',
    },
    loanAmount: {
      fontSize: 16,
      fontWeight: '800',
    },
    totalAmountSmall: {
      fontSize: 13,
      fontWeight: '600',
      color: '#64748b',
    },

    // category icon 
    catItem: {
        flexDirection:'row',
        gap:10,
        alignItems: 'center',
        justifyContent:'flex-start',
    },
    catIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catName: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.light.textMain,
        fontWeight:'700',
    },

    //CATEGORY
    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 24,
    },
    previewIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
     nameInputContainer: {
        flex: 1,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.light.textMain,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.textSub,
        marginBottom: 16,
        marginTop: 8,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorCircleSelected: {
        borderColor: Colors.light.primary,
        transform: [{ scale: 1.1 }],
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 40,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
})

export default styles