import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState,  } from "react";
import { useNavigation, StackActions } from "@react-navigation/native";
import { styles } from "../../assets/styles/moreStyle";
import { IUser, USER_SEED } from "../../store/seed/user";
import { mockHelpItems } from "../../store/seed/help";

export default function MoreScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<IUser>(USER_SEED)
  
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isHelpVisible, setHelpVisible] = useState(false);

  // Hàm tạo icon viết tắt từ tên người dùng
  const createIconAcc=()=>{
    const nameArray = user.name.split(' ');
    if (nameArray.length === 1) return nameArray[0][0].toUpperCase();
    return `${nameArray[0][0].toUpperCase()}${nameArray[nameArray.length-1][0].toUpperCase()}`;
  }
  const iconAcc = createIconAcc();

  const formatCurrency = (value: number | string) => {
    return Number(value).toLocaleString('vi-VN') + ' đ';
  };

  const helpItems = mockHelpItems;
  
  const renderMenuItem = (icon: any, title: string, onPress?: () => void, showChevron = true) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <MaterialIcons name={icon} size={22} color={Colors.light.textSub} style={styles.menuIcon} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.light.borderInput} />
      )}
    </TouchableOpacity>
  );

  // Xử lý đăng xuất
  const handleSignOut = ()=>{
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          navigation.dispatch(StackActions.replace("LayoutAuth"))
        },
      },
    ]);
  }

  const renderInfoRow = (label: string, value: string, icon: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <View style={styles.infoIconContainer}>
          <MaterialIcons name={icon} size={18} color={Colors.light.primary} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderModalFrame = (title: string, isVisible: boolean, onClose: () => void, children: React.ReactNode) => (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={Colors.light.textMain} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
    <View style={styles.container}>
      {/* ===== HEADER BACKGROUND ===== */}
      <View style={styles.headerBg} />

      <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.navBar}>
          <View style={{width:50}}/>
          <Text style={styles.navTitle}>Settings</Text>
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
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuList}>
            {renderMenuItem("person-outline", "Personal Information", () => setProfileModalVisible(true))}
            {renderMenuItem("help-outline", "Help", () => setHelpVisible(true))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* User Profile Modal */}
      <Modal
        visible={isProfileModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Profile</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.light.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>{iconAcc}</Text>
              </View>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            <View style={styles.infoContainer}>
              {renderInfoRow("User ID", user.id, "fingerprint")}
              {renderInfoRow("Username", user.name, "person")}
              {renderInfoRow("Email", user.email, "email")}
              {renderInfoRow("Created date", user.createdAt, "event-available")}
              {renderInfoRow("Last input", user.lastInput, "history")}
            </View>

            <TouchableOpacity 
                style={styles.closeModalBtn}
                onPress={() => setProfileModalVisible(false)}
            >
                <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </>
  )
}