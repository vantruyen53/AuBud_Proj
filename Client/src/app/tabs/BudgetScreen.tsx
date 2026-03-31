import {ScrollView,StyleSheet,Text,TouchableOpacity,View, ViewStyle, TextStyle, Alert, RefreshControl} from "react-native";
import { useEffect, useMemo, useState,useCallback } from "react";
import mockBudget from '@/src/store/seed/budget';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";

import {HomeStackNavProp} from '@/src/models/types/RootStackParamList'
import { Colors, Fonts } from "@/src/constants/theme";
import CategoryPieChart from '@/src/components/pieChart';
import { formatCurrency } from "@/src/utils/format";
import { ModalBudget } from "@/src/components/customModal";
import { BudgetDTO, CategoryDTO } from "@/src/models/interface/DTO";
import { BudgetApp } from "@/src/store/application/BudgetApp";
import { useProvider } from "@/src/hooks/useProvider";
import { Budgets } from "@/src/models/interface/Entities";
import LoadingLogo from "@/src/components/loadingOverlay";
import AutoBudgetModal from "@/src/components/AutoBudgetModal";

interface BudgetProposal{
  categoryId: string;
    categoryName: string;
    iconName: string;
    iconColor: string;
    categoryType:string;
    target: string;
    date: string;
}
export default function BudgetScreen() {
  const navigation = useNavigation<HomeStackNavProp>();
  const month = new Date().getMonth()+1;
  const year = new Date().getFullYear();
  const {id, accessToken, walletScreen}=useProvider()
  const budgetApp = useMemo(()=>
    new BudgetApp({id, accessToken}),[id, accessToken]
  )


  const [budgets, setBudget]=useState<Budgets[]>([])
  const [aiBudgets, setAiBudgets] = useState<BudgetProposal[]>([])

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isOpenAutoBudget, setIsOpenAutoBudget] = useState(false)
  const [modalType, setModalType]=useState<'add'|'edit'>('add')
  const [modalStatus, setModalStatus] = useState<'idle' | 'loading' | 'generating'>('idle');

  const [formData, setFormData] = useState<any>({})

  const [trigger, setTrigger]=useState(0)
  const [isLoading, setIsLoading] = useState(false)

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

  const loadData = async (isReturn: boolean = false)=>{
    const budgets = await budgetApp.getBudgets((currentMonth.getMonth()+1).toString(), currentMonth.getFullYear().toString());
    if(isReturn){
      if(budgets) {
        setBudget(budgets)
        return budgets
      };
      return [];
    }

  }

  useFocusEffect(
    useCallback( ()=>{
      const fetchData =async()=>{
       setIsLoading(true)

        const freshBudgets = await loadData(true);

        const isOpenAutoBudget = (currentMonth.getMonth() + 1 ===month && currentMonth.getFullYear() === year) 
          && freshBudgets?.length === 0 && aiBudgets.length === 0;
        setIsOpenAutoBudget(isOpenAutoBudget);

       setIsLoading(false)
     }
     fetchData();
    }, [currentMonth, trigger])
  )

  const onRefresh = useCallback(async () => {
    setIsLoading(true);
    
    await loadData();
    
    setIsLoading(false); 
  }, [id, accessToken, currentMonth, ]);

  // Helper function để lấy màu thanh progress bar
  const getProgressBarColor = (percentage: number) => {
      if (percentage >= 100) return Colors.light.error;
      if (percentage > 80) return Colors.light.warning;
      if(percentage>60) return Colors.light.success;
      return Colors.light.primary; 
  };

  const currentMonthValue = year * 12 + month; // tháng hiện tại
  const viewingMonthValue = currentMonth.getFullYear() * 12 + (currentMonth.getMonth() + 1); // tháng đang xem

  const isTooEarly = viewingMonthValue < currentMonthValue;        // trước tháng hiện tại → ẩn nút
  const isTooFar   = viewingMonthValue > currentMonthValue + 1;    // sau tháng tiếp theo → hiện nhưng alert
  const canAdd     = !isTooEarly;  

  const showError = (message?: string) => {
    Alert.alert("Error", message || "Something went wrong. Please try again.");
  };

  const handleSave = async ()=>{
    const {categoryId, target} = formData;
    const payLoad = {target, categoryId, date: monthYear, status: 'active'} as BudgetDTO;
    
    const { success, message } = await budgetApp.createBudget(payLoad);
    if (success) {
      setIsModalVisible(false);
      setTrigger(pre => pre + 1);
    } else {
      showError(message);
    }
  }

  const handleEdit = async () => {
    const { success, message } = await budgetApp.updateBudget(formData.target, formData.budgetId);
    if (success) {
      setIsModalVisible(false);
      setTrigger(pre => pre + 1);
    } else {
      showError(message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure to delete this budget?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { success, message } = await budgetApp.deleteBudget(id);
          if (success) {
            setIsModalVisible(false);
            setTrigger(pre => pre + 1);
          } else {
            showError(message);
          }
        },
      },
    ]);
  };

  const handleGenerateAutoBudget = async () => {
    try {
      setModalStatus('loading');
      const proposal = await budgetApp.generateAutoBudget(month, year,walletScreen.rawData.wallets,
        (status: "idle" | "loading" | "generating")=>setModalStatus(status));

      console.log('[PAGE] Auto budget proposal:', proposal);

      if(proposal.budgets.length === 0 && (proposal.message !=="" && proposal.message !== undefined)) {
        showError(proposal.message || "Failed to generate auto budget. Please try again.");
        setModalStatus('idle');
        setIsOpenAutoBudget(false);
        return;
      }

      setAiBudgets(proposal.budgets);
      setModalStatus('idle');
      setIsOpenAutoBudget(false);
    } catch (error:any) {
        showError(error.message || "Failed to generate auto budget. Please try again.");
        setModalStatus('idle');
        setIsOpenAutoBudget(false);
    }
  };

  const handleClearAiBudgets = async()=>{
    setAiBudgets([]);
    setModalStatus('idle');
  }

  const handleSaveAllAiBudgets = async()=>{
    const payLoads: BudgetDTO[] = aiBudgets.map(b => ({
      categoryId: b.categoryId,
      target: b.target,
      date: monthYear,
      status: 'active'
    }));

    const { success, message } = await budgetApp.createMultipleBudgets(payLoads);
    if (success) {      
      setAiBudgets([]);
      setTrigger(pre => pre + 1);
    } else {
      showError(message);
    }
  }

  if(isLoading)
    return <LoadingLogo logoSource={require('../../assets/images/welcome.png')}/>
  else
    return (
      <View style={styles.container}>
        {/* ===== HEADER BACKGROUND ===== */}
        <View style={styles.headerBg}/>

        <SafeAreaView style={{ flex: 1 }}>

          {/* ===== TOP NAVIGATION ===== */}
          <View style={styles.navBar}>
            <Text style={styles.navTitle}>Budget goal</Text>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={onRefresh}
                colors={[Colors.light.primary]} // Màu icon xoay trên Android
                tintColor={Colors.light.primary} // Màu icon xoay trên iOS
              />
            }
          >
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
                  data={budgets}
                  showLabel={false}
                  size={220}
                />
              </View>
            </View>

            {/* --- BUDGET CATEGORIES LIST --- */}
            {aiBudgets.length > 0 && (
              <>
                {/* Header thông báo đây là gợi ý từ AI */}
                <View style={styles.aiHeaderInfo}>
                  <MaterialIcons name="smart-toy" size={20} color="#12D0FF" />
                  <Text style={styles.aiHeaderText}>AI Budget Suggestions</Text>
                </View>

                {aiBudgets.map((item, index) => {
                  const remaining = parseFloat(item.target) - 0;
                  const percentage = 0; // Luôn là 0% cho gợi ý mới

                  return (
                    <TouchableOpacity 
                      key={item.categoryId} 
                      // Áp dụng thêm style aiBudgetCard để làm nhạt màu
                      style={[styles.budgetCard, styles.aiBudgetCard]} 
                      onPress={() => {
                        setFormData({ ...formData, budgetId: item.categoryId, target: item.target, categoryName: item.categoryName })
                        setModalType('edit')
                        setIsModalVisible(true)
                      }}
                      onLongPress={() => handleDelete(item.categoryId)}
                    >
                      {/* Nội dung bên trong giữ nguyên nhưng sẽ tự động nhạt đi nhờ opacity của card cha */}
                      <View style={styles.budgetCardHeader}>
                        <View style={[styles.categoryIconWrapper, { backgroundColor: `rgba(${item.iconColor},0.1)` }]}>
                          <MaterialIcons name={item.iconName as any} size={20} color={`rgb(${item.iconColor})`} />
                        </View>
                        <Text style={styles.categoryName}>{item.categoryName}</Text>
                        <View style={styles.budgetCardRight}>
                          <Text style={styles.remainingLabel}>Remain</Text>
                          <Text style={styles.remainingAmount}>
                            {formatCurrency(remaining, { absolute: true })}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `0%`, backgroundColor: '#E5E7EB' }]} />
                      </View>

                      <View style={styles.budgetCardFooter}>
                        <Text style={styles.budgetLabel}>Target: {formatCurrency(parseInt(item.target))}</Text>
                        <View style={[styles.aiBadge]}>
                          <MaterialIcons name="auto-awesome" size={15} color="#fff" />
                          <Text style={{ marginLeft: 4, color: '#fff', }}>AI Suggestion</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Cụm nút điều khiển bên dưới danh sách AI */}
                <View style={styles.aiActionContainer}>
                  <TouchableOpacity style={styles.clearButton} onPress={handleClearAiBudgets}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.saveAllButton} onPress={handleSaveAllAiBudgets}>
                    <MaterialDesignIcons name="creation" size={18} color="#FFF" />
                    <Text style={styles.saveAllButtonText}>Save All</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {budgets.length<=0?aiBudgets.length<=0 ? <Text style={styles.noTransactionsText}>No budget in {monthYear}</Text> : '' : 
            budgets.map((item)=>{
              const remaining = item.target - item.balance;
              const percentage =
                item.target > 0
                  ? Math.round((item.balance / item.target) * 100)
                  : 0;
              
              return(
                <TouchableOpacity key={item.id} style={styles.budgetCard} 
                  onPress={()=>{
                    setFormData({...formData,budgetId:item.id, target:item.target, categoryName: item.category.name})
                    setModalType('edit')
                    setIsModalVisible(true)
                  }}
                  onLongPress={()=>handleDelete(item.id)}  
                  >
                  <View style={styles.budgetCardHeader}>
                    <View style={[styles.categoryIconWrapper, { backgroundColor: `rgba(${item.category.iconColor},0.1)` }]}>
                      <MaterialIcons
                        name={item.category.iconName as any} 
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
                      {formatCurrency(item.target, {absolute:true})}
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
            {(canAdd && aiBudgets.length <= 0) && (
              <TouchableOpacity
                style={styles.addBudgetBtn}
                onPress={() => {
                  if (isTooFar) {
                    Alert.alert(
                      "Warning",
                      "Bạn không thể lập ngân sách cho thời gian quá sớm!",[
                      { text: "Got it", style: "cancel" }
                    ]);
                    return;
                  }
                  setIsModalVisible(true);
                  setModalType('add');
                }}
              >
                <MaterialIcons name="add-circle" size={24} color={Colors.light.primary} />
                <Text style={styles.addBudgetText}>Add new budget</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
            <ModalBudget 
              visible={isModalVisible}
              onPressClose={()=>{setIsModalVisible(false),setFormData({})}}
              onPressSave={()=>handleSave()}
              onPressEdit={()=>handleEdit()}
              formData={formData}
              onChangeText={(target:number)=>setFormData({...formData, target})}
              nav={()=>{
                setIsModalVisible(false)
                navigation.navigate('allCategory',{
                    setSelectedCategory: (categorie: CategoryDTO) =>
                      setFormData({...formData,categoryId: categorie.id, ...categorie}),
                    setIsOpenCatNameInput:(status:boolean)=>
                      setIsModalVisible(status)
              })}}
              type={modalType}
            />
          
        </SafeAreaView>

        <AutoBudgetModal
          isVisible={isOpenAutoBudget}
          onClose={() => {setIsOpenAutoBudget(false); setModalStatus('idle');}}
          status={modalStatus}
          onConfirm={handleGenerateAutoBudget}
        />
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
  noTransactionsText: {
    fontSize: 14,
    color: Colors.light.placeholder,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
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

  /* Style dành riêng cho AI Budget Item */
  aiHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
    paddingHorizontal: 4,
  },
  aiHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#12d0ff',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  aiBudgetCard: {
    opacity: 0.5, // Làm nhạt card
    borderStyle: 'solid', // Đường viền đứt đoạn tạo cảm giác "chưa chính thức"
    borderColor: '#12d0ff60',
    backgroundColor: 'rgba(18, 208, 255, 0.02)', // Nền xanh cực nhạt
  },
  aiBadge: {
    fontSize: 10,
    backgroundColor: 'rgba(18, 208, 255, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontWeight: '700',
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Style cho cụm nút Clear và Save/Generate */
  aiActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.error, // Màu xám nhạt
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveAllButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12D0FF', // Màu chủ đạo của bạn
    shadowColor: '#12D0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveAllButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
})