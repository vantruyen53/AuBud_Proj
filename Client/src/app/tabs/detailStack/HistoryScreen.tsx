import {Text,View,TouchableOpacity,TextInput,Alert,Animated,SectionListData,} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { SwipeListView } from "react-native-swipe-list-view";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// UI STATE
import { ModalTime } from "../../../components/customModal";
import MonthGrid from "@/src/components/monthGrid";
import YearList from "@/src/components/yearList";
import Transaction from "../../../components/transaction";
import Calendar from "@/src/components/calendar";
import { styles } from "@/src/assets/styles/historyStyle";
import { Colors, linearGradient } from "@/src/constants/theme";

//CUSTOM VIEW
import { useProvider } from "@/src/hooks/useProvider";
import { HomeStackNavProp } from "../../../models/types/RootStackParamList";
import {dateFormat,formatCurrency,convertDateFormat,} from "@/src/utils/format";
import { IDateState, ITransactionItem } from "../../../models/interface/Entities";
import { getTransactionSections } from "../../../utils/generateSectionList ";
import { TransactionApp } from "@/src/store/application/TransactionApp";
import { ITransactionSection } from "../../../models/IApp";

export default function HistoryScreen() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const {id, accessToken}=useProvider()
  const tractionApp = new TransactionApp({ id: id, accessToken: accessToken });

  //UI STATE
  const [timeLine, setTimeLine] = useState<"Date" | "Month" | "Year">("Date");
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("sending");
  const [isSearch, setIsSearch] = useState(false);
  const [isOpenMonthGrid, setIsOpenMonthGrid] = useState(false);
  const [isOpenYearList, setIsOpenYearList] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [yearShown, setYearShown] = useState(year);
  const [trigger, setTrigger]=useState(0)

  //HANDLE DATA 
  const [searchContent, setSearchContent] = useState("");
  const [specificTime, setSpecificTime] = useState<IDateState>({y: year.toString(),m: month.toString(),d: day.toString(),});
  const [editingTx, setEditingTx] = useState<ITransactionItem | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<any>({});

  //DATA MANAGEMENT
  const [allTransactions, setAllTransactions] = useState<ITransactionItem[]>([]);
  const [summary, setSummary] = useState({totalSending: 0,totalIncome: 0,balance: 0,});

  // Effect 1: set specificTime khi timeLine thay đổi
  useFocusEffect(
    useCallback(() => {
      switch (timeLine) {
        case "Date":
          setSpecificTime({ y: year.toString(), m: month.toString(), d: day.toString() });
          break;
        case "Month":
          setSpecificTime({ y: year.toString(), m: month.toString(), d: "" });
          break;
        case "Year":
          setSpecificTime({ y: year.toString(), m: "", d: "" });
          break;
        default:
          setSpecificTime({ y: year.toString(), m: month.toString(), d: "" });
          break;
      }
    }, [timeLine])
  );

  // Effect 2: fetch data khi specificTime thay đổi
  useEffect(() => {
    const fetchData = async () => {
      const since = timeLine === "Date" ? 'day' : timeLine === "Month" ? 'month' : 'year';
      const result = await tractionApp.getTransactionHistory(
        parseInt(specificTime.d) || 0,
        parseInt(specificTime.m) || 0,
        parseInt(specificTime.y),
        since
      );
      if (result) {
        setAllTransactions(result.rawTransactions);
        setSummary({
          totalSending: result.totalSending,
          totalIncome: result.totalIncome,
          balance: result.balance,
        });
      }
    };
    fetchData();
  }, [specificTime, timeLine, searchContent, isSearch, trigger]);

  //3. Lọc danh và gom nhóm theo chữ cái
  const sections = useMemo(() => {
    const dataFilterd = allTransactions.filter(t => t.type===activeCategoryTab)  
    return getTransactionSections(dataFilterd);
  }, [activeCategoryTab, allTransactions, trigger]);

  //4. Tạo các thành cho SwipeListView
  const renderHeader = () => (
    <>
      {/* Selecte time  */}
      <View style={styles.selecteTime}>
        <View style={styles.tabsSelectTime  }>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.selecteTimeBTn}
          >
            <Text style={[styles.selecteTimeText,{color:"#fff"}]}>{timeLine}</Text>
            <MaterialIcons name="crop-free" size={16} color="#fff"/>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={
              timeLine === "Month"
                ? () => setIsOpenMonthGrid(!isOpenMonthGrid)
                : timeLine === "Year"
                  ? () => setIsOpenYearList(!isOpenYearList)
                  : () => setIsOpenCalendar(!isOpenCalendar)
            }
            style={[styles.selecteTimeBTn, {backgroundColor:'#fff'}]}
          >
            <Text style={[styles.selecteTimeText, {color:"#006c87",}]}>
              {timeLine === "Date"
                ? dateFormat(
                    parseInt(specificTime.d),
                    parseInt(specificTime.m),
                    parseInt(specificTime.y),
                  )
                : timeLine === "Month"
                  ? `${specificTime.y}/${specificTime.m}`
                  : timeLine === "Year"
                    ? specificTime.y
                    : null}
            </Text>
            <MaterialIcons name="crop-free" size={16} color="#006c87"/>
          </TouchableOpacity>
        </View>
      </View>

      <ModalTime
        isVisible={showModal}
        onPressClose={() => setShowModal(false)}
        timeLine={timeLine}
        setTimeLine={setTimeLine}
      />

      {/* summary card  */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={linearGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.linearGradient}
        />
        <View style={styles.statsRow}>
          {/* Left: Total Balance */}
          <View style={styles.statItemMain}>
            <Text
              style={styles.statValueMain}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(summary.balance, { absolute: true })}
            </Text>
            <View style={styles.statLabelRow}>
              <MaterialDesignIcons
                name="compare-vertical"
                size={12}
                color="#fff"
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>DIFFERCENS</Text>
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
                {formatCurrency(summary.totalIncome, { absolute: true })}
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
                {formatCurrency(summary.totalSending, { absolute: true })}
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
      </View>

      {/* Segment Control (Chi/Thu) */}
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
      {sections.length===0 && (
           <Text style={styles.noTransactionsText}>No transactions today</Text>
        )}
    </>
  );
  const renderSectionHeader = (info: { section: any }) => (
    <View style={{ paddingTop: 10, paddingBottom: 10 }}>
      <Text style={{ fontWeight: "600", fontSize: 14 }}>
        {convertDateFormat(info.section.title, true)}
      </Text>
    </View>
  );
  const renderItem = (data: any, rowMap: any) => {
    const item = data.item as ITransactionItem;
    return (
      <Transaction
        title={item.title}
        wallet={item.wallet}
        amount={formatCurrency(item.type==='sending'?Number(`-${item.amount}`):item.amount)}
        categoryName={item.category.name}
        iconName={item.category.iconName}
        iconColor={item.category.iconColor}
        type={item.type}
        showData={true}
        handleEdit={() => handleEdit(item, rowMap)}
      />
    );
  };

  //5. Các handle cho custom modal
  const handleOverYear = () => {
    Alert.alert("Warning", "You can't move to year that bigger current year!", [
      { text: "Got it", style: "cancel" },
    ]);
  };
  const selecteMonth = (monthSelected: string) => {
    setSpecificTime({ y: yearShown.toString(), m: monthSelected, d: "" });
    setIsOpenMonthGrid(false);
  };
  const selectYear = (yearSelected: string) => {
    setSpecificTime({ y: yearSelected.toString(), m: "", d: "" });
    setIsOpenYearList(false);
  };
  const preYear = (yearShown: number) => setYearShown(yearShown - 1);
  const nexYear = (yearShown: number) => {
    if (yearShown < year) {
      setYearShown((prev) => prev + 1);
    } else {
      handleOverYear();
    }
  };
  const handleDateSelect = (year: number, m: number, d: number) =>
    setSpecificTime({ y: year.toString(), m: m.toString(), d: d.toString() });

  //6. Hanld sửa và xóa
  const handleEdit = (tx: ITransactionItem, rowMap: any) => {
    if (rowMap[tx.id]) {
      rowMap[tx.id].closeRow();
    }
    setEditingTx(tx);
    setFormData(tx);
    setModalVisible(true);
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

  const navigation = useNavigation<HomeStackNavProp>();

  return (
    <View  style={styles.container}>
       <View style={{  backgroundColor:"#12D0FF", paddingBottom:30, paddingHorizontal:16, paddingTop: 10}}>
          <SafeAreaView edges={["top"]} style={styles.header}>
            {isSearch ? (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setIsSearch(false)}
                >
                  <MaterialIcons name="arrow-back-ios" size={16} color="#fff"/>
                </TouchableOpacity>
                <View style={styles.formSearch}>
                  <TextInput
                    value={searchContent}
                    onChangeText={setSearchContent}
                    style={styles.contentSearch}
                    autoFocus
                  />
                  {searchContent.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => setSearchContent("")}
                      style={styles.clearFrom}
                    >
                      <MaterialIcons name="close" />
                    </TouchableOpacity>
                  ) : (
                    ""
                  )}
                </View>
                <TouchableOpacity style={styles.filterSearch} onPress={() => {}}>
                  <MaterialIcons
                    name="filter-list"
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>History transaction</Text>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setIsSearch(true)}
                >
                  <MaterialIcons
                    name="search"
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </>
            )}
          </SafeAreaView>
       </View>

       <View style={styles.containerList}>
          <SwipeListView
          useSectionList
          sections={sections as any}
          keyExtractor={(item: ITransactionItem) => item.id}
          rightOpenValue={-80}
          disableRightSwipe={true}
          swipeToOpenPercent={40}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          renderHiddenItem={(data, rowMap) => (
            <TouchableOpacity
              onPress={() => handleDelete(data.item)}
              style={styles.deleteAction}
            >
              <Animated.View style={styles.deleteActionContent}>
                <Text style={styles.deleteActionText}>Delete</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
        />
       </View>

       {isOpenMonthGrid && timeLine === "Month" ? (
        <MonthGrid
          yearShown={yearShown}
          preYear={() => preYear(yearShown)}
          nexYear={() => nexYear(yearShown)}
          specificTime={specificTime}
          selecteMonth={selecteMonth}
        />
      ) : isOpenYearList && timeLine === "Year" ? (
        <YearList
          currentYear={year}
          selectYear={selectYear}
          specificTime={specificTime}
        />
      ) : isOpenCalendar && timeLine === "Date" ? (
        <Calendar
          onPress={(year: number, m: number, d: number) =>
            handleDateSelect(year, m, d)
          }
          onPressClose={() => setIsOpenCalendar((pre) => !pre)}
          specificTime={specificTime}
        />
      ) : null}
    </View>
  );
}
