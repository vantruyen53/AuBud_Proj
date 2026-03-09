//Import library
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert 
} from "react-native";
import { useState, useMemo, useEffect, useCallback  } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Colors, mainColor, linearGradient } from "@/src/constants/theme";
import { Eye, EyeOff } from "lucide-react-native";
import { useNavigation, useFocusEffect  } from "@react-navigation/native";
import { Bell } from "lucide-react-native";

//Import custome file
import { styles } from "../../assets/styles/homeStyle";
import { useProvider } from "@/src/hooks/useProvider";
import { formatCurrency } from "@/src/utils/format";
import { SwipeListView } from "react-native-swipe-list-view";
import Transaction from "../../components/transaction";
import FloatAddBtn from "../../components/floatAddBtn";
import { ModalForm } from "../../components/customModal";
import { LinearGradient } from "expo-linear-gradient";
import { HomeStackNavProp } from "../../models/types/RootStackParamList";
import BarChart from "@/src/components/barChartTransaction";
import { totalSenIn } from "@/src/utils/helper";
import { ITransactionItem } from "@/src/models/interface/Entities";
import { TransactionApp } from "@/src/store/application/TransactionApp";
import {createIconAcc} from '@/src/utils/helper';
import { useNotificationStore } from "../../store/application/NotificationStore";
 import { useNotification } from "../../hooks/useNotification";
 import { socketService } from "../../services/Socketservice";
 import { setSocketReconnectCallback } from "@/src/services/auth/apiService";
 import { usePushNotification } from "@/src/hooks/usePushNotification";

export default function HomeScreen() {
  const y = new Date().getFullYear();
  const m = new Date().getMonth() + 1;
  const d = new Date().getDate();
  const { isShowData, toggleShowData, id, userName, accessToken } =useProvider();
  const tractionApp = new TransactionApp({ id: id, accessToken: accessToken });
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // 1. State quản lý dữ liệu gốc
  const [allTransactions, setAllTransactions] = useState<ITransactionItem[]>([]);
  const [summary, setSummary] = useState({totalSending: 0,totalIncome: 0,balance: 0,});
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("sending");
  const [stateViewTransaction, setStateViewTransaction] = useState<"detail" | "chart">("chart");
  const [isModalVisible, setModalVisible] = useState(false);

  //Handle data
  const [editingTx, setEditingTx] = useState<ITransactionItem | null>(null);
  const [formData, setFormData] = useState<any>({});
  // const [data, setData] = useState<{ sending: number; income: number }>({sending: 0,income: 0,});

  const navigation = useNavigation<HomeStackNavProp>();
  const nameArray = userName.split(" ");
  const displayName =nameArray.length > 1 ? nameArray[nameArray.length - 1] : userName;
  const IconText = createIconAcc(userName);

  const [trigger, setTrigger]=useState(0)

  // ✅ Connect socket 1 lần duy nhất khi có accessToken
  useEffect(() => {
    if (accessToken) socketService.connect(accessToken);

    setSocketReconnectCallback((newToken: string) => {
      socketService.disconnect();
      socketService.connect(newToken);
      usePushNotification(accessToken);
    });

    return () => socketService.disconnect(); // chỉ disconnect khi unmount HomeScreen
  }, [accessToken]);

   useNotification(accessToken);

  // 1. Lấy dữ liệu tổng quan cho summary card và mảng gốc để filter "transaction today"
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        const result = await tractionApp.getTransactionHistory(0,m, y, 'month');
        if (result) {
          setAllTransactions(result.rawTransactions);
          setSummary({
            totalSending: result.totalSending,
            totalIncome: result.totalIncome,
            balance: result.balance,
          });
        }
        setIsLoading(false);
      };
      fetchData();
    }, [m, y,trigger, accessToken])
  )

  // 2. TÍNH TOÁN "HÔM NAY": Dùng useMemo để không tính lại thừa
  const transactionsToday = useMemo(() => {
    const monthStr = m < 10 ? `0${m}` : `${m}`;
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const dateStr = `${y}-${monthStr}-${dayStr}`;
    return allTransactions.filter((t) => {
      const transactionDate = t.date?.split(' ')[0];
      return transactionDate === dateStr;
    });
  }, [allTransactions]);


  // 3. LỌC THEO TAB (Sending/Income)
  const flattenedData = useMemo(() => {
    return transactionsToday.filter((t) => t.type === activeCategoryTab);
  }, [transactionsToday, activeCategoryTab]);

  // 4. DỮ LIỆU BIỂU ĐỒ HÔM NAY
  const chartData = useMemo(() => {
    const sending = totalSenIn(transactionsToday, "sending");
    const income = totalSenIn(transactionsToday, "income");
    return { sending, income };

  }, [transactionsToday]);

  // 5. Handle action
  const handleEdit = (tx: ITransactionItem) => {
    navigation.navigate("addTransaction",{
      hanldeType:'edit',
      payLoad: tx,
    })
  };
  const handleDelete = (payLoad: ITransactionItem) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa giao dịch này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const result = await tractionApp.deleteTransaction(payLoad);
            if(result)
              setTrigger(pre=>pre+1)
          },
        },
      ],
    );
  };
  const handleSave = () => {};
  const handleDetail=(item:ITransactionItem)=>{}

  const renderHeader = () => (
    <>
      {/* Header Container */}
      <View style={styles.headerContainer}>
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
            <Text style={styles.accountName}>{displayName}</Text>
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
              {m}/{y}
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
              {isShowData
                ? formatCurrency(summary.balance, { showSign: false })
                : "******"}
            </Text>
            <View style={styles.statLabelRow}>
              <MaterialDesignIcons
                name="wallet-outline"
                size={14}
                color="#64748B"
              />
              <Text style={styles.statLabel}>YOUR CURRENT BALANCE</Text>
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
                {isShowData
                  ? formatCurrency(summary.totalIncome, { absolute: true })
                  : "******"}
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
                {isShowData
                  ? formatCurrency(summary.totalSending, { absolute: true })
                  : "******"}
              </Text>
              <View style={styles.statLabelRow}>
                <MaterialDesignIcons
                  name="arrow-down-circle"
                  size={12}
                  color="#DC2626"
                />
                <Text style={[styles.statLabelSmall, { color: "#DC2626" }]}>
                  SENDING
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
        <Text style={styles.recentTransactionsTitle}>Trasaction today</Text>
        <TouchableOpacity
          onPress={() =>
            setStateViewTransaction((prev) =>
              prev === "detail" ? "chart" : "detail",
            )
          }
        >
          <Text style={styles.seeMoreLink}>
            {stateViewTransaction === "detail" ? "Chart" : "Detail"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segment Control (Chi/Thu) */}
      {stateViewTransaction === "detail" ? (
        <>
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
                Sending
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
          {flattenedData.length <= 0 && (
            <Text style={styles.noTransactionsText}>No transactions today</Text>
          )}
        </>
      ) : (
        <BarChart sending={chartData.sending} income={chartData.income} />
      )}
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Top Bar */}
        <View style={{  backgroundColor:"#12D0FF", }}>
          <SafeAreaView edges={["top"]} style={styles.navBar}>
            <View style={styles.headerProfile}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>{IconText}</Text>
              </View>
              <View style={styles.headerWelcome}>
                <Text style={styles.headerGreeting}>Good morning,</Text>
                <Text style={styles.headerUserName}>{displayName}</Text>
              </View>
            </View>
            <View style={styles.topRight}>
              {/* History  */}
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate("history")}
              >
                <MaterialIcons name="history-edu" size={22} color="#fff" />
                <Text style={styles.historyText}>History</Text>
              </TouchableOpacity>

              {/* Notification  */}
              <TouchableOpacity
                style={styles.notification}
                onPress={() => navigation.navigate('notifacation')}
                activeOpacity={0.7}
              >
                 <Bell size={22} color="#fff" />

                 {unreadCount > 0 && (
                    <View style={styles.noteText}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        <View  style={styles.container}>
          {/* Main Content Overlay */}
          {stateViewTransaction === "detail" ? (
            <SwipeListView
              style={{paddingBottom:80}}
              data={flattenedData}
              keyExtractor={(item: ITransactionItem) => item.id}
              ListHeaderComponent={renderHeader}
              showsVerticalScrollIndicator={false}
              rightOpenValue={-160}
              disableRightSwipe={true}
              swipeToOpenPercent={40}
              renderItem={(data, rowMap) => (
                <Transaction
                  title={data.item.title}
                  wallet={data.item.wallet}
                  amount={formatCurrency(data.item.type==="sending"?Number(`-${data.item.amount}`):data.item.amount)}
                  categoryName={data.item.category.name}
                  iconName={data.item.category.iconName}
                  iconColor={data.item.category.iconColor}
                  type={data.item.type}
                  showData={isShowData}
                  handleDetail={() => {handleDetail(data.item);}}
                />
              )}
              renderHiddenItem={(data, rowMap) => (
                <View style={styles.hiddenContainer}>
                  <TouchableOpacity
                    onPress={() => handleDelete(data.item)}
                    style={[styles.deleteAction, {backgroundColor: '#EF4444'}]}
                  >
                    <Animated.View style={styles.deleteActionContent}>
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </Animated.View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEdit(data.item)}
                    style={[styles.deleteAction, {backgroundColor:"#37bcff"}]}
                  >
                    <Animated.View style={styles.deleteActionContent}>
                      <Text style={styles.deleteActionText}>Edit</Text>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
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
            navigation={() => navigation.navigate("addTransaction",{})}
          />

          {/* Edit Transaction Modal */}
          <ModalForm
            isVisible={isModalVisible}
            type="transaction"
            onPressClose={() => setModalVisible(false)}
            onPressDelete={() =>
              handleDelete(editingTx as ITransactionItem)
            }
            onPressSave={() => {
              handleSave();
            }}
            formData={formData}
            setFormData={setFormData}
          />
        </View>
    </GestureHandlerRootView>
  );
}
