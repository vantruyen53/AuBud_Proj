import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "@/src/constants/theme";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState,  } from "react";
import { useNavigation, StackActions } from "@react-navigation/native";

interface IUser{
  name:string,
  email:string,
}

export default function MoreScreen() {
  const navigation = useNavigation();
  const [user, serUser]=useState<IUser>({name:'nguyen truyen', email:'nguyentruyen@gmail.com'})

  const createIconAcc=()=>{
    const nameArray = user.name.split(' ');
    return `${nameArray[0][0].toUpperCase()}${nameArray[nameArray.length-1][0].toUpperCase()}`;
  }
  const iconAcc = createIconAcc();
  const renderMenuItem = (icon: any, title: string, showChevron = true) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <MaterialIcons name={icon} size={22} color={Colors.light.textSub} style={styles.menuIcon} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.light.borderInput} />
      )}
    </TouchableOpacity>
  );

  const handleSignOut = ()=>{
    Alert.alert("Sign out", "Are you sure to sign ut?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          navigation.dispatch(StackActions.replace("LayoutAuth"))
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* ===== HEADER BACKGROUND ===== */}
      <View style={styles.headerBg} />

      <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.navBar}>
          <View style={{width:50}}/>
          <Text style={styles.navTitle}>Setting</Text>
          <View style={styles.version}>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}> 
          <View style={[styles.card, styles.shadow]}>
            <View style={styles.acc}>
              <View style={styles.icon}>
                <Text style={styles.iconText}>{iconAcc}</Text>
              </View>
              <View style={styles.infor}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.phone}>{user.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={()=>handleSignOut()}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuList}>
            {renderMenuItem("person-outline", "Thông tin cá nhân")}
            {renderMenuItem("bar-chart", "Báo cáo trong năm")}
            {renderMenuItem("ssid-chart", "Báo cáo danh mục trong năm")}
            {renderMenuItem("calendar-month", "Chi phí cố định và thu nhập định kì")}
            {renderMenuItem("help-outline", "Trợ giúp")}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

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
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
})