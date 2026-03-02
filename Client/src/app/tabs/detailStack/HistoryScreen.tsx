import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  SectionListData,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../assets/styles/historyStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Colors, linearGradient } from "../../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { HomeStackNavProp } from "../../../models/types/RootStackParamList";
import { ModalTime } from "../../../components/customModal";
import {
  dateFormat,
  formatCurrency,
  convertDateFormat,
} from "../../../utils/format";
import MonthGrid from "../../../components/monthGrid";
import YearList from "../../../components/yearList";
import { IDateState } from "../../../models/IApp";
import { LinearGradient } from "expo-linear-gradient";
import { SwipeListView } from "react-native-swipe-list-view";
import { getTransactionSections } from "../../../utils/generateSectionList";
import { ITransaction, ITransactionSection } from "../../../models/IApp";
import Transaction from "../../../components/transaction";
import Calendar from "../../../components/calendar";

export default function HistoryScreen() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Các trạng thái lọc và hiển thị
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("sending");
  const [isSearch, setIsSearch] = useState(false);
  
  // Trạng thái mở các bộ chọn thời gian
  const [isOpenMonthGrid, setIsOpenMonthGrid] = useState(false);
  const [isOpenYearList, setIsOpenYearList] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  
  // Nội dung tìm kiếm
  const [content, setContent] = useState("");
  
  // Loại timeline đang chọn (Ngày/Tháng/Năm)
  const [timeLine, setTimeLine] = useState<"Date" | "Month" | "Year">("Date");
  
  // Thời gian cụ thể đang xem
  const [specificTime, setSpecificTime] = useState<IDateState>({
    y: year.toString(),
    m: month.toString(),
    d: day.toString(),
  });
  
  const [showModal, setShowModal] = useState(false);
  const [yearShown, setYearShown] = useState(year);
  
  // Quản lý trạng thái chỉnh sửa giao dịch
  const [editingTx, setEditingTx] = useState<ITransaction | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Cập nhật giá trị thời gian mặc định khi thay đổi timeline
  useEffect(() => {
    switch (timeLine) {
      case "Date":
        setSpecificTime({
          y: year.toString(),
          m: month.toString(),
          d: day.toString(),
        });
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
  }, [timeLine]);

  const handleOverYear = () => {
    Alert.alert("Warning", "You cannot view data for a future year!", [
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

  const sections = useMemo(() => {
    return getTransactionSections(activeCategoryTab);
  }, [activeCategoryTab]);

  const handleEdit = (tx: ITransaction, rowMap: any) => {
    if (rowMap[tx.id]) {
      rowMap[tx.id].closeRow();
    }
    setEditingTx(tx);
    setFormData(tx);
    setModalVisible(true);
  };

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
              // Thực hiện logic xóa giao dịch ở đây
          },
        },
      ],
    );
  };  

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        {isSearch ? (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsSearch(false)}
            >
              <MaterialIcons name="arrow-back-ios" size={16} />
            </TouchableOpacity>
            <View style={styles.formSearch}>
              <TextInput
                value={content}
                onChangeText={setContent}
                style={styles.contentSearch}
                autoFocus
              />
              {content.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setContent("")}
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
                color={Colors.light.iconLight}
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
                size={20}
                color={Colors.light.iconLight}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setIsSearch(true)}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={Colors.light.tabIconDefault}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Selecte time  */}
      <View style={styles.selecteTime}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.selecteTimeBTn}
          >
            <Text style={styles.selecteTimeText}>{timeLine}</Text>
            <MaterialIcons name="crop-free" size={16} />
          </TouchableOpacity>
          <View style={styles.placeHolder} />
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            onPress={
              timeLine === "Month"
                ? () => setIsOpenMonthGrid(!isOpenMonthGrid)
                : timeLine === "Year"
                  ? () => setIsOpenYearList(!isOpenYearList)
                  : () => setIsOpenCalendar(!isOpenCalendar)
            }
            style={styles.selecteTimeBTn}
          >
            <Text style={styles.selecteTimeText}>
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
            <MaterialIcons name="crop-free" size={16} />
          </TouchableOpacity>
          <View style={styles.placeHolder} />
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
              {formatCurrency(0, { absolute: true })}
            </Text>
            <View style={styles.statLabelRow}>
              <MaterialDesignIcons
                name="compare-vertical"
                size={12}
                color="#fff"
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>DIFFERENCE</Text>
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
                {formatCurrency(0, { absolute: true })}
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
                {formatCurrency(0, { absolute: true })}
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
    const item = data.item as ITransaction;
    return (
      <Transaction
        title={item.title}
        wallet={item.wallet}
        amount={formatCurrency(parseInt(item.amount))}
        categoryName={item.category.name}
        iconName={item.category.iconName}
        iconColor={item.category.iconColor}
        type={item.type}
        showData={true}
        handleEdit={() => handleEdit(item, rowMap)}
      />
    );
  };


  const handleDateSelect = (year: number, m: number, d: number) =>
    setSpecificTime({ y: year.toString(), m: m.toString(), d: d.toString() });

  const navigation = useNavigation<HomeStackNavProp>();
  return (
    <SafeAreaView style={styles.container}>
      {/* list transaction */}
      <SwipeListView
        useSectionList
        sections={sections as any}
        keyExtractor={(item: ITransaction) => item.id}
        rightOpenValue={-80}
        disableRightSwipe={true}
        swipeToOpenPercent={40}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
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
    </SafeAreaView>
  );
}
