import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../../constants/theme";

const styles = StyleSheet.create({
    container:{
            flex: 1,
            backgroundColor: Colors.light.inputBg,
            padding: 16,
            paddingBottom:0,
            position:'relative'
    }, 
        // Header
        header: {
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
            fontSize: 18,
            fontWeight: "600",
            color: Colors.light.textMain,
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

        // header tab 
        headerTabs:{
            flexDirection:'row',
            borderBottomWidth:1,
            borderBottomColor:'#e1e1e1',
        },
        typeTab:{
            flex:1,
            justifyContent:'center',
            paddingVertical:15,
            alignItems:'center',
        },
        typeTabAction:{
            borderBottomWidth:2,
            borderBottomColor:Colors.light.primary,
        },
        tabText:{
           fontWeight:'600',
           fontSize:16 
        },
        tabTextAction:{
            color:Colors.light.primary
        },

    // renderHiddenItem
    hiddenContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: Colors.light.inputBg, // Màu nền phía sau khi vuốt
        paddingRight: 10,
    },
    hiddenBtn: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Khoảng cách giữa 2 nút
        // Shadow nhẹ cho nút trông nổi hơn
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    //   Delete category item 
    deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
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

    //fab
    fab:{
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 100,
    },

    // category item 
    catItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.inputBg,
        gap: 12,
        // Thêm border bottom nhẹ để phân cách nếu muốn
        borderBottomWidth: 0.5,
        borderBottomColor: '#F1F5F9',
    },
    catIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catIconBgSelected: {
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    catName: {
        fontSize: 15,
        color: Colors.light.textMain,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '90%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.textMain,
    },
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
    inputLabel: {
        fontSize: 12,
        color: Colors.light.textSub,
        marginBottom: 4,
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
});

export default styles;
