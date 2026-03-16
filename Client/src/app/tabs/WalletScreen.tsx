import { ScrollView, RefreshControl, Text, TouchableOpacity, View, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Eye, EyeOff } from "lucide-react-native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation, useFocusEffect  } from "@react-navigation/native";

import { formatCurrency } from "@/src/utils/format";
import { WalletApp} from '@/src/store/application/WalletApp';
import { HomeStackNavProp } from "../../models/types/RootStackParamList";
import { IWallet,ISaving,IDebt,IGroupFund, IDebtHistory, ISavingHistory } from "@/src/models/interface/Entities";
import styles from '@/src/assets/styles/walletStyle';
import { useProvider } from "@/src/hooks/useProvider";
import { extractWallet } from '@/src/utils/helper';
import { ModalForm, ModalWalletHistory, ModalWallet } from '@/src/components/customModal';
import { CreateDebtDTO } from '@/src/models/interface/DTO';
import { Colors } from '@/src/constants/theme';


export default function WalletScreen() {
  // 1. State quản lý dữ liệu gốc
  const [groupFunds, setGroupFunds] = useState<IGroupFund[]>([]);
  const [walletHistories, setWalletHistoies]=useState<any[]|null>([])

  //mỗi thao tác CRUD thành công gọi triggerRefresh() để re-render view
  const [refreshKey, setRefreshKey] = useState(0);
  const { isShowData, toggleShowData, id, accessToken, walletScreen, refreshWallet } = useProvider();
  // Modal states
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const [isOpenModalHistory, setIsOpenModalHistory]= useState(false);
  const [isOpenWalletsForCreateDebt, setIsOpenWalletsForCreateDebt]= useState(false);
  const [modalType, setModalType] = useState<'wallet' | 'saving' | 'group' | 'debt' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [historyRefreshing, setHistoryRefreshing] = useState(false);

  //Handle data
  const [formData, setFormData] = useState<any>(null);
  const [typeAction, setTypeAction]=useState<'add' | 'edit'>('add')
  const [historyWallet, setHistoryWallet]=useState<{id:string, balance: number, actionType:string}>({id:'', balance:0, actionType:''})
  const [walletForCreateDebt, setWalletForCreateDebt]=useState<IWallet>({id:'', balance:0, name:''})

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);
  const walletApp = new WalletApp({id:id, accessToken:accessToken})

  const wallets = useMemo(() => walletScreen?.rawData.wallets || [], [walletScreen]);
  const savings = useMemo(() => walletScreen?.rawData.savings || [], [walletScreen]);
  const debts = useMemo(()=>walletScreen?.rawData.debts || [], [walletScreen])

  const totalData = useMemo(() => ({
    w: walletScreen?.summary.totalWalletBalance || 0,
    s: walletScreen?.summary.totalSavingBalance || 0,
    gF:walletScreen?.summary.totalGroupFundBalance || 0,
    lf:walletScreen?.summary.totalLoanFrom || 0, 
    lt:walletScreen?.summary.totalLoanTo || 0, 
    tNW:walletScreen?.totalNetWorth || 0
    // ... các trường khác
  }), [walletScreen]);

  useFocusEffect(
    useCallback(()=>{
       refreshWallet(id, accessToken);
    },[])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Bắt đầu hiện icon xoay
    await refreshWallet(id, accessToken);
    setRefreshing(false); // Tắt icon xoay sau khi xong
  }, [id, accessToken]);

  const handleDelete = (type: string, walletId: string) => {
    Alert.alert(
      "Delete",
      "If you delete this wallet, will all transactions from this wallet also be deleted? Please consider this.",
      [
        { text: "Cancal", style: "cancel" },
        { 
          text: "Delele", 
          style: "destructive",
          onPress: async () => {
            const result = await walletApp.deleteWallet(walletId, type as 'wallet' | 'saving' | 'debt')
            if(result){
              triggerRefresh()
              setModalVisible(false);
              await refreshWallet(id, accessToken);
            }
          }
        }
      ]
    );
  };

  const handleSave= async()=>{
    const payLoad = extractWallet(modalType, formData, id, walletForCreateDebt.id)
    console.log('========', modalType)
    if(payLoad)
     try {
        if (typeAction === 'add') {
          if(modalType==="debt"){

            const p=payLoad as CreateDebtDTO;

            let newPaymentWalletBalance;
            if(p.type==='loan_from')
              newPaymentWalletBalance = walletForCreateDebt.balance+p.totalAmount;
            else
              newPaymentWalletBalance = walletForCreateDebt.balance-p.totalAmount;

            const result = await walletApp.createNewWallet(payLoad, newPaymentWalletBalance)
            if(result)
              triggerRefresh()
          }else{
            const reslut =await walletApp.createNewWallet(payLoad)
            
            console.log('=======',reslut)
            if(reslut)
              triggerRefresh()
          } 
        } else {
          const reslut = await walletApp.updateWallet(payLoad)
          if(reslut)
            triggerRefresh() 
        }
        await refreshWallet(id, accessToken);
        setModalVisible(false)
      } catch (err) {
        Alert.alert("Error", `Something went wrong ${err}`)
      }
    else
      Alert.alert("Error", "All field required")
  }

  const openModal = (type: 'wallet' | 'saving' | 'group' | 'debt', item: any = null, typeAction:'edit'|'add') => {
    setModalType(type);
    setModalVisible(true);
    setFormData(item);
    setTypeAction(typeAction)
  };

  const handleOpenHistory =async (id: string, actionType: string)=>{
    setIsOpenModalHistory(true)
    setHistoryRefreshing(true);
      try {
      const result = await walletApp.getWalletHistory(id, actionType);
      setWalletHistoies(result);
    } catch (error) {
      console.log("Lỗi tải lịch sử:", error);
    } finally {
      setHistoryRefreshing(false);
    }
  }

  const onRefreshHistory = async()=>{
    if (!historyWallet.id) return;
    setHistoryRefreshing(true)

    const result = await walletApp.getWalletHistory(historyWallet.id, historyWallet.actionType)
    
    setWalletHistoies(result);
    setHistoryRefreshing(false);
  }

  const hanldDeleteItem = async (itemId:string, amount:string, walletId:string, type:string)=>{

    Alert.alert(
      "Delete",
      "Are you sure to delete this transaction? Please consider this.",
      [
        { text: "Cancal", style: "cancel" },
        { 
          text: "Delele", 
          style: "destructive",
          onPress: async () => {
            let newBalance;
            const wallet = wallets.filter(w=>w.id===walletId);

            if(!wallet)
              Alert.alert("Error", "The wallet used to execute this transaction has been deleted. You cannot delete this transaction again.", [
                { text: "Got it", style: "cancel" },
              ]);

            let wBalance = wallet[0].balance;

            if(historyWallet.actionType==='saving'){
              newBalance = historyWallet.balance - parseInt(amount);
              wBalance = wBalance+ parseInt(amount);
            }
            else{
              newBalance = historyWallet.balance + parseInt(amount)
              wBalance = type==='repay_to'?wBalance+parseInt(amount):wBalance-parseInt(amount);
            }
            const result = await walletApp.deleteWalletHistoryItem(historyWallet.id , historyWallet.actionType, itemId, newBalance, walletId, wBalance)
            if(result) {triggerRefresh(), setIsOpenModalHistory(false)}
          }
        }
      ]
    );
    // console.log('actionType: ',historyWallet.actionType)
    // console.log('itemId: ', itemId)
    // console.log('amount: ', amount)
    // console.log('===================================')
    // console.log('foreign id: ',historyWallet.id)
    // console.log('old balance: ', historyWallet.balance)
    // console.log('newBalance: ', newBalance)
    //  console.log('===================================')
    // console.log('walletId: ', walletId)
    // console.log('old balance: ', wallet[0].balance)
    // console.log('newBalance: ', wBalance)
  }
  // console.log('=================================== ', walletForCreateDebt)
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>My wallets</Text>
            </View>
            
            {/* header  */}
            <View style={styles.totalBalanceCard}>
              <View style={styles.totalHeaderRow}>
                <Text style={styles.totalLabel}>TOTAL BALANCE</Text>
                <TouchableOpacity onPress={toggleShowData}>
                    {isShowData ? (
                      <Eye size={14} color="#6366F1" />
                    ) : (
                      <EyeOff size={14} color="#6366F1" />
                    )}
                </TouchableOpacity>
              </View>

              <Text style={styles.totalAmount}>{isShowData ? formatCurrency(totalData.tNW, {absolute:true}) : '******'}</Text>
            </View>

          </SafeAreaView>

        </View>
          {/* list types of wallets  */}
        <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[Colors.light.primary]} // Màu icon xoay trên Android
                tintColor={Colors.light.primary} // Màu icon xoay trên iOS
              />
            }
          >
            {/* Wallets Section */}
            {wallets.length>0&&
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Wallets</Text>
                <View style={styles.sectionTotal}>
                  <Text style={styles.headerLabel}>Total:</Text>
                  <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalData.w, { showPositiveSign: false }) : '******'}</Text>
                </View>
              </View>
            }
            {wallets?.map(item=>(
              <TouchableOpacity 
                  key={item.id}  
                  style={styles.walletItem}
                  onPress={() => openModal('wallet', item,'edit')}
                >
                    <View style={styles.icon}>
                        <MaterialIcons
                            name="account-balance-wallet"
                            size={24}
                            color='#059669'
                        />
                    </View>
                    <View>
                        <Text style={styles.walletName}>{item.name}</Text>
                        <Text style={styles.balance}>{isShowData ? formatCurrency(item.balance,  { showPositiveSign: false }) : '******'}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            {/* Group Funds Section */}
            {
              groupFunds.length>0 &&
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Group funds</Text>
                <View style={styles.sectionTotal}>
                  <Text style={styles.headerLabel}>Total:</Text>
                  <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalData.gF, {absolute:true}) : '******'}</Text>
                </View>
              </View>
            }
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupFundsScroll}>
              {groupFunds?.map(item=>(
                <TouchableOpacity 
                  key={item.id}
                  style={styles.groupCard}
                  onPress={() => openModal('group', item,'edit')}
                >
                  <View style={styles.groupIconBox}>
                    <MaterialIcons name='groups' size={24} color="#6366F1" />
                  </View>
                  <Text style={styles.groupName}>{item.fundName}</Text>
                  <Text style={styles.groupBalance}>{isShowData ? formatCurrency(item.balance, {absolute:true}) : '******'}</Text>
                  <View style={styles.groupMembers}>
                    <MaterialIcons name="person" size={12} color="#94A3B8" />
                    <Text style={styles.groupMembersText}>{item.groupName} member</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Savings Section */}
           {
            savings.length>0 &&
             <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings</Text>
              <View style={styles.sectionTotal}>
                <Text style={styles.headerLabel}>Total:</Text>
                <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalData.s, {absolute:true}) : '******'}</Text>
              </View>
            </View> 
           }
            {savings?.map(item=>(
                 <TouchableOpacity 
                  key={item.id}
                  style={styles.savingsCard}
                  onPress={() => openModal('saving', item,'edit')}
                 onLongPress={()=>{handleOpenHistory(item.id, 'saving'), setHistoryWallet({id:item.id, balance:item.balance, actionType:'saving'})}}
                >
                  <View style={styles.savingsTop}>
                    <View style={styles.savingsIconBox}>
                      <MaterialIcons name='savings' size={20} color="#12D0FF"/>
                    </View>
                    <View style={styles.savingsNameBox}>
                      <Text style={styles.savingsName}>{item.name}</Text>
                      <Text style={styles.savingsTarget}>Target: {isShowData ? formatCurrency(item.target, {absolute:true}) : '******'}</Text>
                    </View>
                    <View style={styles.rightActionCol}>
                       <Text style={styles.savingsBalance}>{isShowData ? formatCurrency(item.balance, {absolute:true}) : '******'}</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(item.balance/item.target)*100}%` }]} />
                  </View>
                  <View style={styles.savingsFooter}>
                     <Text style={styles.progressText}>{((item.balance/item.target)*100).toFixed(1)}%</Text>
                     <Text style={[styles.progressText, {color: '#64748B'}]}>Remain {formatCurrency(item.target - item.balance, {absolute:true})}</Text>
                  </View>
                </TouchableOpacity>
            ))}

            {/* Debts Section */}
            {
              debts.length>0&&
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Debts & Loan</Text>
                <View>
                  <View style={styles.sectionTotal}>
                    <Text style={styles.headerLabel}>Total debts:</Text>
                    <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalData.lf, {absolute:true}) : '******'}</Text>
                  </View>
                  <View style={styles.sectionTotal}>
                    <Text style={styles.headerLabel}>Total loan:</Text>
                    <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalData.lt, {absolute:true}) : '******'}</Text>
                  </View>
                </View>
              </View>
            }
            {debts?.map((item)=>{
                const isLoanFrom = item.type === "loan_from";
                const mainColor = isLoanFrom ? '#059669' : '#d90000';
                const bgColor = isLoanFrom ? '#05966915' : '#d9000015';
                return(
                <TouchableOpacity
                  key={item.id}
                  onPress={() => openModal('debt', item,'edit')}
                  onLongPress={()=>{handleOpenHistory(item.id, 'debt'), setHistoryWallet({id:item.id, balance:item.remaining, actionType:'debt'})}}
                  style={styles.debtItem}
                >
                  {/* Cụm bên trái: Icon + Thông tin tên */}
                  <View style={styles.leftInfor}>
                    <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                      <MaterialDesignIcons
                        name={isLoanFrom ? "tag-plus" : "tag-minus"}
                        size={22}
                        color={mainColor}
                      />
                    </View>
                    <View style={styles.nameContainer}>
                      <Text style={styles.loanName} numberOfLines={1}>
                        {isLoanFrom ? `Borrowed from` : `Lent to`}
                      </Text>
                      <Text style={styles.partnerNameText}>{item.partnerName}</Text>
                      <Text style={styles.timeLoan}>{item.name}</Text>
                    </View>
                  </View>

                  {/* Cụm bên phải: Số tiền */}
                  <View style={styles.rightInforWrapper}>
                    <View style={styles.amountRow}>
                      <Text style={styles.textAmountLabel}>Remain</Text>
                      <Text style={[styles.loanAmount, { color: mainColor }]}>
                        {isShowData ? formatCurrency(item.remaining, {absolute:true}) : '******'}
                      </Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.textAmountLabel}>Total</Text>
                      <Text style={styles.totalAmountSmall}>
                        {isShowData ? `${item.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫` : '******'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )})}

            <View style={{ height: 70 }} />
        </ScrollView>

          {/* Fab   */}
        <TouchableOpacity 
            style={styles.fab} 
            onPress={() => setTypeModalVisible(true)}
        >
          <MaterialIcons name="add" size={32} color="#FFF" />
        </TouchableOpacity>

        {/* Type Selection Modal */}
        <Modal
          visible={isTypeModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setTypeModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setTypeModalVisible(false)}
          >
            <View style={styles.selectionMenu}>
              <Text style={styles.selectionTitle}>Select a type of wallets</Text>
              
              <TouchableOpacity 
                style={styles.selectionItem} 
                onPress={() => { setTypeModalVisible(false); openModal('wallet',null,'add'); }}
              >
                <View style={[styles.selectionIcon, {backgroundColor: '#EEF2FF'}]}>
                  <MaterialIcons name="account-balance-wallet" size={24} color="#6366F1" />
                </View>
                <Text style={styles.selectionText}>Add new wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.selectionItem} 
                onPress={() => { setTypeModalVisible(false); openModal('saving',null,'add'); }}
              >
                <View style={[styles.selectionIcon, {backgroundColor: '#ECFDF5'}]}>
                  <MaterialIcons name="savings" size={24} color="#10B981" />
                </View>
                <Text style={styles.selectionText}>Add new saving book</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.selectionItem} 
                onPress={() => { setTypeModalVisible(false); openModal('debt',null,'add'); }}
              >
                <View style={[styles.selectionIcon, {backgroundColor: '#FEF2F2'}]}>
                  <MaterialIcons name="cached" size={24} color="#EF4444" />
                </View>
                <Text style={styles.selectionText}>Add new debt/loan</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ModalForm
          isVisible={isModalVisible}
          type={modalType}
          typeAction={typeAction}
          onPressClose={()=>setModalVisible(false)}
          formData={formData}
          setFormData={setFormData}
          onPressDelete={handleDelete}
          onPressSave={handleSave}
          onSelectWallet={()=>{setModalVisible(false),setIsOpenWalletsForCreateDebt(true)}}
          paymentWallet={walletForCreateDebt}
        />
        <ModalWalletHistory
          isOpen={isOpenModalHistory}
          onPressClose={()=>setIsOpenModalHistory(false)}
          data={walletHistories}
          onDeleteItem={hanldDeleteItem}
          typeAction="history"
          refreshing={onRefreshHistory}
          isRefreshing={historyRefreshing}
        />

        {isOpenWalletsForCreateDebt&&<ModalWallet
          onPressClose={() => {
                      setIsOpenWalletsForCreateDebt((pre) => !pre);
                    }}
                    data={wallets}
                    walletSelected={formData?.paymentWalletId ??''}
                    onSelected={async (id: string, name: string,balance: number) => {
                      setWalletForCreateDebt({id:id,name:name, balance});
                      setFormData({ ...formData, paymentWalletId: id,});
                      setModalVisible(true);
          }}
        />}

      </View>
    </GestureHandlerRootView>
  )
}