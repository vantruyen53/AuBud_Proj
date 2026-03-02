import { StyleSheet } from "react-native";
import { Colors, Fonts } from "@/src/constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Fonts.rounded,
  },

  version:{
    textAlign:'right',
    width:50,
  },
  versionText:{
    fontSize:12,
    fontWeight:'400',
    color:'#fff'
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  acc:{
    flex:1,
    flexDirection:'row', 
    gap:7, 
    alignItems:'center',
    marginBottom:20
  },
  icon:{
    width:45,
    height:45,
    borderRadius:50,
    borderWidth:3,
    borderStyle:'solid',
    borderColor:Colors.light.primary,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#fff',
  },
  iconText:{
    fontSize:20,
    fontWeight:'700',
    color:Colors.light.primary,
  },
  infor:{

  },
  userName:{
    fontWeight:'700',
    fontSize:16,
  },
  phone:{
    fontWeight:'500',
    fontSize:14,
  },
  signOutBtn:{
    borderRadius:12,
    backgroundColor:Colors.light.primary,
    alignItems:'center',
    justifyContent:'center',
    paddingVertical:10
  },
  signOutText:{
    color:'#fff',
    fontSize:18,
    fontWeight:'600',
  },

  menuList: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderInput,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderInput,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
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
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textMain,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    borderWidth: 4,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.textMain,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.textSub,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(12, 169, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.textSub,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.textMain,
    fontWeight: '700',
  },
  closeModalBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export { styles };
