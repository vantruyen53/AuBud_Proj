import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { styles } from "../../assets/styles/homeStyle";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Colors, mainColor, linearGradient } from "../../constants/theme";
import { Eye, EyeOff } from "lucide-react-native";
import { useProvider } from "../../hooks/useProvider";
import { formatCurrency } from "../../utils/format";
import { SwipeListView } from "react-native-swipe-list-view";
import Transaction from "../../components/transaction";
import FloatAddBtn from "../../components/floatAddBtn";
import { generateMockTransaction } from "../../utils/generateSectionList";
import { ITransaction } from "../../models/IApp";
import { ModalForm } from "../../components/customModal";
import { IUser, USER_SEED } from "../../store/seed/user";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { HomeStackNavProp } from "../../models/types/RootStackParamList";
import BarChart from "../../components/barChartTransaction";
import { totalSenIn } from "../../utils/helper";

export default function HomeScreen() {
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("sending");
  
  // State lưu trữ giao dịch đang chỉnh sửa
  const [editingTx, setEditingTx] = useState<ITransaction | null>(null);
  
  // State lưu trữ danh sách giao dịch theo ngày
  const [transactions, setTransactions] = useState<
    Record<string, ITransaction[]>
  >(generateMockTransaction());
  
  // Sử dụng provider để quản lý trạng thái hiển thị dữ liệu (ẩn/hiện số tiền)
  const { isShowData, toggleShowData } = useProvider();
  
  // State quản lý hiển thị modal chỉnh sửa
  const [isModalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // State chuyển đổi giữa chế độ xem chi tiết và biểu đồ
  const [stateViewTransaction, setStateViewTransaction] = useState<
    "detail" | "chart"
  >("chart");
  const [data, setData] = useState<{ sending: number; income: number }>({
    sending: 0,
    income: 0,
  });

  // Cập nhật giao dịch khi thay đổi tab (chi tiêu/thu nhập)
  useEffect(() => {
    const newData = generateMockTransaction(activeCategoryTab);
    setTransactions(newData);
  }, [activeCategoryTab]);

  const navigation = useNavigation<HomeStackNavProp>();

  const flattenedData = useMemo(() => {
    return Object.values(transactions).flat();
  }, [transactions]);

  // Tính toán tổng thu chi để hiển thị trên biểu đồ
  useEffect(() => {
    const incomeFlat = Object.values(generateMockTransaction("income")).flat();
    const sendingFlat = Object.values(
      generateMockTransaction("sending"),
    ).flat();
    const fetchData = async () => {
      const data = await totalSenIn(sendingFlat, incomeFlat);
      setData(data);
    };
    fetchData();
  }, [transactions]);

  const handleEdit = (tx: ITransaction, rowMap: any) => {
    if (rowMap[tx.id]) {
      rowMap[tx.id].closeRow();
    }
    setEditingTx(tx);
    setFormData(tx);
    setModalVisible(true);
  };

  // Xử lý xóa giao dịch
  const handleDelete = (id: string, dateStr: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTransactions((prev) => {
              const newData = { ...prev };
              newData[dateStr] = newData[dateStr].filter((tx) => tx.id !== id);
              return newData;
            });
          },
        },
      ],
    );
  };

  const handleSave = () => {};

  const renderHeader = () => (
    <>
      {/* Header Container */}
      <View style={styles.headerContainer}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            
          </View>

          
        </View>

        {/* Account/Piggy List Horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountList}
          style={{ flexGrow: 0 }}
          
        >
          <View style={styles.accountItem}>
            
            <View style={styles.accountIconWrapper}>
              <View style={styles.accountIconBg}>
                <MaterialDesignIcons
                  name="piggy-bank"
                  size={28}
                  color={Colors.light.primary}
                />
              </View>
            </View>
            <Text style={styles.accountName}>truyen</Text>
          </View>

          <TouchableOpacity
            style={styles.accountItem}
            onPress={() => navigation.navigate("group")}
          >
            <View style={styles.addAccountBg}>
              <MaterialIcons name="add" size={24} color={mainColor} />
            </View>
            <Text style={styles.addAccountText}>Add ...</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {/* ================= DASHBOARD MODE ================= */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={linearGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.linearGradient}
        />
        <View style={styles.monthSelector}>
          <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>
              {m + 1}/{y}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {/* Left: Total Balance */}
          <View style={styles.statItemMain}>
            <Text
              style={styles.statValueMain}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {isShowData ? formatCurrency(0, { showSign: false }) : "******"}
            </Text>
            <View style={styles.statLabelRow}>
              <MaterialDesignIcons
                name="wallet-outline"
                size={14}
                color="#64748B"
              />
              <Text style={styles.statLabel}>CURRENT BALANCE</Text>
            </View>
          </View>

          {/* Right: Income & Expense stacked */}
          <View style={styles.rightStatsCol}>
            <View style={styles.statItemSubRight}>
              <Text
                style={styles.statValueIncomeSmall}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {isShowData ? formatCurrency(0, { absolute: true }) : "******"}
              </Text>
              <View style={styles.statLabelRow}>
                <MaterialDesignIcons
                  name="arrow-up-circle"
                  size={12}
                  color="#059669"
                />
                <Text style={[styles.statLabelSmall, { color: "#059669" }]}>
                  INCOME
                </Text>
              </View>
            </View>

            <View style={styles.statItemSubRight}>
              <Text
                style={styles.statValueExpenseSmall}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {isShowData ? formatCurrency(0, { absolute: true }) : "******"}
              </Text>
              <View style={styles.statLabelRow}>
                <MaterialDesignIcons
                  name="arrow-down-circle"
                  size={12}
                  color="#DC2626"
                />
                <Text style={[styles.statLabelSmall, { color: "#DC2626" }]}>
                  SPENDING
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionCircleButton}>
            <MaterialIcons name="email" size={14} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCircleButton}
            onPress={toggleShowData}
          >
            {isShowData ? (
              <Eye size={14} color="#6366F1" />
            ) : (
              <EyeOff size={14} color="#6366F1" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= TRANSACTION LIST ================= */}
      <View style={styles.transactionsHeaderRow}>
        <Text style={styles.recentTransactionsTitle}>Today's transactions</Text>
        <TouchableOpacity
          onPress={() =>
            setStateViewTransaction(
              stateViewTransaction === "detail" ? "chart" : "detail",
            )
          }
        >
          <Text style={styles.seeMoreLink}>
            {stateViewTransaction === "detail" ? "Chart" : "Detail"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segment Control (Chi/Thu) */}
      {stateViewTransaction === "detail" && (
        <View style={styles.segmentControlContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeCategoryTab === "sending" && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveCategoryTab("sending")}
          >
            <Text
              style={[
                styles.segmentText,
                activeCategoryTab === "sending" && styles.segmentTextActive,
              ]}
            >
              Spending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeCategoryTab === "income" && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveCategoryTab("income")}
          >
            <Text
              style={[
                styles.segmentText,
                activeCategoryTab === "income" && styles.segmentTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* summary chart  */}
      {stateViewTransaction === "detail" ? null : (
        <BarChart sending={data.sending} income={data.income} />
      )}
    </>
  );

  const getAvatarText = (name: string) => {
    const names = name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBg}
      >
        <View style={[styles.headerShape, { width: 150, height: 150, top: -50, right: -50 }]} />
        <View style={[styles.headerShape, { width: 100, height: 100, bottom: -20, left: -30 }]} />
      </LinearGradient>

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.navBar}>
          <View style={styles.headerProfile}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{getAvatarText(USER_SEED.name)}</Text>
            </View>
            <View style={styles.headerWelcome}>
              <Text style={styles.headerGreeting}>Good morning,</Text>
              <Text style={styles.headerUserName}>{USER_SEED.name}</Text>
            </View>
          </View>
          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate("history")}
            >
              <MaterialIcons name="history-edu" size={22} color="#fff" />
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notification}
              onPress={() => navigation.navigate('notifacation')}
            >
              <MaterialDesignIcons
                name="bell"
                color="#FFF"
                size={22}
              />
              <Text style={styles.noteText}>4</Text>
            </TouchableOpacity>
          </View>

          
        </View>

        <View style={styles.container}>
        {/* Main Content Overlay */}
        {stateViewTransaction === "detail" ? (
          <SwipeListView
            data={flattenedData}
            keyExtractor={(item: ITransaction) => item.id}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            rightOpenValue={-80}
            disableRightSwipe={true}
            swipeToOpenPercent={40}
            renderItem={(data, rowMap) => (
              <Transaction
                title={data.item.title}
                wallet={data.item.wallet}
                amount={data.item.amount}
                categoryName={data.item.category.name}
                iconName={data.item.category.iconName}
                iconColor={data.item.category.iconColor}
                type={data.item.type}
                showData={isShowData}
                handleEdit={() => {
                  handleEdit(data.item, rowMap);
                }}
              />
            )}
            renderHiddenItem={(data, rowMap) => (
              <TouchableOpacity
                onPress={() => handleDelete(data.item.id, data.item.date)}
                style={styles.deleteAction}
              >
                <Animated.View style={styles.deleteActionContent}>
                  <Text style={styles.deleteActionText}>Delete</Text>
                </Animated.View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderHeader()}
          </ScrollView>
        )}

        {/* Floating Action Button - Sky Blue */}
        <FloatAddBtn
          name="edit"
          size="24"
          navigation={() => navigation.navigate("addTransaction")}
        />

        {/* Edit Transaction Modal */}
        <ModalForm
          isVisible={isModalVisible}
          type="transaction" 
          onPressClose={() => setModalVisible(false)}
          onPressDelete={() =>
            handleDelete(editingTx?.id || "", editingTx?.date || "")
          }
          onPressSave={() => {
            handleSave();
          }}
          formData={formData}
          setFormData={setFormData}
        />
      </View>
    </SafeAreaView>
  </GestureHandlerRootView>
  );
}
