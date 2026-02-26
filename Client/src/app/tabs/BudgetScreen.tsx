import {ScrollView,StyleSheet,Text,TouchableOpacity,View, ViewStyle, TextStyle} from "react-native";
import { useState } from "react";
import mockBudget from '@/src/store/seed/budget';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {HomeStackNavProp} from '@/src/models/types/RootStackParamList'
import { Colors, Fonts } from "@/src/constants/theme";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import CategoryPieChart from '@/src/components/pieChart';
import { formatCurrency } from "@/src/utils/format";
import { ModalBudget } from "@/src/components/customModal";
import { ICategory } from "@/src/models/IApp";

export default function BudgetScreen() {
  const navigation = useNavigation<HomeStackNavProp>();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpenModalBudget, setIsOpenModalBudget]=useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [target, setTarget] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<ICategory>({id:'', name:'',type:'', iconName:'', iconColor:''});

  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };
  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const monthYear = `${String(currentMonth.getMonth() + 1).padStart(2, "0")}/${currentMonth.getFullYear()}`;
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const dateRange = `(01/${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${daysInMonth}/${String(currentMonth.getMonth() + 1).padStart(2, "0")})`;

  // Helper function để lấy màu thanh progress bar
  const getProgressBarColor = (percentage: number) => {
      if (percentage >= 100) return Colors.light.error;
      if (percentage > 80) return Colors.light.warning;
      if(percentage>60) return Colors.light.success;
      return Colors.light.primary; 
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER BACKGROUND ===== */}
      <View style={styles.headerBg}/>

      <SafeAreaView style={{ flex: 1 }}>

        {/* ===== TOP NAVIGATION ===== */}
        <View style={styles.navBar}>
          <Text style={styles.navTitle}>Budget goal</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           {/* ===== MONTH SELECTOR ===== */}
          <View style={[styles.card, styles.shadow]}>
             <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
              <MaterialIcons name="chevron-left" size={24} color={Colors.light.textSub} />
            </TouchableOpacity>
            <View style={styles.monthTextWrapper}>
              <Text style={styles.monthText}>{monthYear}</Text>
              <Text style={styles.dateRangeText}>{dateRange}</Text>
            </View>
            <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
              <MaterialIcons name="chevron-right" size={24} color={Colors.light.textSub} />
            </TouchableOpacity>
          </View>

          {/* ===== ACCOUNT GAUGE CARD ===== */}
          <View style={[styles.card, styles.shadow, styles.gaugeCard]}>
            <View style={styles.gaugeContainer}>
              <CategoryPieChart
                data={mockBudget}
                showLabel={false}
                size={220}
              />
            </View>
          </View>

          {/* --- BUDGET CATEGORIES LIST --- */}
          {mockBudget.map((item)=>{
            const remaining = item.totalAmount - item.balance;
            const percentage =
              item.totalAmount > 0
                ? Math.round((item.balance / item.totalAmount) * 100)
                : 0;
            
            return(
              <TouchableOpacity key={item.id} style={styles.budgetCard}>
                <View style={styles.budgetCardHeader}>
                  <View style={[styles.categoryIconWrapper, { backgroundColor: `rgba(${item.category.iconColor},0.1)` }]}>
                    <MaterialIcons
                      name={item.category.iconName}
                      size={20}
                      color={`rgb(${item.category.iconColor})`}
                    />
                  </View>
                  <Text style={styles.categoryName}>{item.category.name}</Text>
                  <View style={styles.budgetCardRight}>
                    <Text style={styles.remainingLabel}>Remain</Text>
                    <Text style={styles.remainingAmount}>
                      {formatCurrency(remaining,{absolute:true})}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.light.placeholder} />
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: getProgressBarColor(percentage),
                      },
                    ]}
                  />
                </View>
                <View style={styles.budgetCardFooter}>
                  <Text style={styles.budgetLabel}>
                    {formatCurrency(item.totalAmount, {absolute:true})}
                  </Text>
                  <Text style={styles.percentageText}>{percentage}%</Text>
                  <Text style={styles.spentLabel}>
                    {formatCurrency(item.balance)}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}

          {/* --- ADD BUDGET BUTTON --- */}
          <TouchableOpacity style={styles.addBudgetBtn}
            onPress={() => {
              setIsOpenModalBudget(true)
              setIsModalVisible(true)
            }}
          >
            <MaterialIcons name="add-circle" size={24} color={Colors.light.primary} />
            <Text style={styles.addBudgetText}>Add new budget</Text>
          </TouchableOpacity>

        </ScrollView>
        {isOpenModalBudget && 
          <ModalBudget 
            visible={isModalVisible}
            onPressClose={()=>setIsOpenModalBudget(false)}
            onPressSave={()=>setIsOpenModalBudget(false)}
            selectedCategory={selectedCategory}
            target={target}
            onChangeText={(target:number)=>setTarget(target)}
            nav={()=>{
              setIsModalVisible(false)
              navigation.navigate('allCategory',{
                  setSelectedCategory: (categorie: ICategory) =>
                    setSelectedCategory(categorie),
                  setIsOpenCatNameInput:(status:boolean)=>
                    setIsModalVisible(status)
            })}}
          />
        }
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
    height: 120,
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Fonts.rounded,
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
    flexDirection:'row',
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Month Selector */
  monthArrow: {
    padding: 8,
  } as ViewStyle,
  monthTextWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    marginHorizontal: 16,
  } as ViewStyle,
  monthText: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.textMain,
  } as TextStyle,
  dateRangeText: {
    fontSize: 12,
    color: Colors.light.textSub,
    marginLeft: 8,
  } as TextStyle,

   //===== ACCOUNT GAUGE CARD ===== 
   gaugeCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  gaugeContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Budget Card */
  budgetCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Clean shadow style
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  } as ViewStyle,
  budgetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  budgetCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.textMain,
  } as TextStyle,
  categoryIconWrapper: {
    marginRight: 12,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.textMain,
  } as TextStyle,
  budgetCardRight: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 8,
  } as ViewStyle,
  remainingLabel: {
    fontSize: 11,
    color: Colors.light.textSub,
    marginRight: 4,
  } as TextStyle,
  remainingAmountMain: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary, // Xanh da trời cho số dư tổng
  },
  remainingAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.primaryDark, // Xanh đậm hơn chút cho item con
  } as TextStyle,

  /* Progress Bar */
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.inputBg,
    borderRadius: 4,
    marginBottom: 10,
    overflow: "hidden",
  } as ViewStyle,
  progressBar: {
    height: "100%",
    borderRadius: 4,
  } as ViewStyle,

  /* Card Footer */
  budgetCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  budgetLabel: {
    fontSize: 11,
    color: Colors.light.textSub,
  } as TextStyle,
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSub,
  } as TextStyle,
  spentLabel: {
    fontSize: 11,
    color: Colors.light.textSub,
  } as TextStyle,

  /* Add Button */
  addBudgetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4fdff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'solid', // Viền nét đứt tạo phong cách thêm mới
  } as ViewStyle,
  addBudgetText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary, // Chữ xanh
  } as TextStyle,
})