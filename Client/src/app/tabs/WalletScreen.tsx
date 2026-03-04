import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Eye, EyeOff } from "lucide-react-native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { ModalForm } from '@/src/components/customModal';
import { useNavigation, useFocusEffect  } from "@react-navigation/native";

import { formatCurrency } from "@/src/utils/format";
import { WalletApp} from '@/src/store/application/WalletApp';
import { HomeStackNavProp } from "../../models/types/RootStackParamList";
import { IWallet,ISaving,IDebt,IGroupFund } from "@/src/models/interface/Entities";
import styles from '@/src/assets/styles/walletStyle';
import { useProvider } from "@/src/hooks/useProvider";
import { extractWallet } from '@/src/utils/helper';


export default function WalletScreen() {
  // 1. State quản lý dữ liệu gốc
  const [wallets, setWallets] = useState<IWallet[]>([]);
  const [savings, setSavings] = useState<ISaving[]>([]);
  const [groupFunds, setGroupFunds] = useState<IGroupFund[]>([]);
  const [debts, setDebts] = useState<IDebt[]>([]);
  //mỗi thao tác CRUD thành công gọi triggerRefresh() đẻe re-render view
  const [refreshKey, setRefreshKey] = useState(0);
  const { isShowData, toggleShowData, id, accessToken } = useProvider();
  const [totalData, setTotalData]=useState<{w:number, s:number, gF:number, lf:number, lt:number, tNW: number}>({
    w:0, s:0, gF:0, lf:0, lt:0, tNW:0
  });

  // Modal states
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'wallet' | 'saving' | 'group' | 'debt' | null>(null);

  //Handle data
  const [formData, setFormData] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [typeAction, setTypeAction]=useState<'add' | 'edit'>('add')

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);
  const navigation = useNavigation<HomeStackNavProp>();
  const walletApp = new WalletApp({id:id, accessToken:accessToken})

  useFocusEffect(
    useCallback(()=>{
      const fetchData = async ()=>{
        const result =await walletApp.loadWalletScreenData()
        if(result){
          setWallets(result.rawData.wallets)
          setSavings(result.rawData.savings)
          setGroupFunds(result.rawData.groupFunds)
          setDebts(result.rawData.debts)

          setTotalData({
            w:result.summary.totalWalletBalance, s:result.summary.totalSavingBalance, gF:result.summary.totalGroupFundBalance,
            lf:result.summary.totalLoanFrom, lt:result.summary.totalLoanTo, tNW:result.totalNetWorth
          })
        }
      }
      fetchData();
    },[refreshKey])
  )

  const handleDelete = (type: string, walletId: string) => {
    Alert.alert(
      "Delete",
      "Are you sure to delete this wallet?",
      [
        { text: "Cancal", style: "cancel" },
        { 
          text: "Delele", 
          style: "destructive",
          onPress: async () => {
            const result = await walletApp.deleteWallet(walletId, type as 'wallet' | 'saving' | 'debt')
            if(result)
              triggerRefresh()
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const handleSave= async()=>{
    const payLoad = extractWallet(modalType, formData, id)
    if(payLoad)
     try {
        if (typeAction === 'add') {
          const reslut =await walletApp.createNewWallet(payLoad)
          if(reslut)
            triggerRefresh() 
        } else {
          const reslut = await walletApp.updateWallet(payLoad)
          if(reslut)
            triggerRefresh() 
        }
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
    setEditingItem(item);
    setFormData(item);
    setTypeAction(typeAction)
  };

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
          >
            {/* Wallets Section */}
            {wallets.length>0&&
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Wallets</Text>
                <View style={styles.sectionTotal}>
                  <Text style={styles.headerLabel}>Total:</Text>
                  <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalData.w, {absolute:true}) : '******'}</Text>
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
                        <Text style={styles.balance}>{isShowData ? formatCurrency(item.balance, {absolute:true}) : '******'}</Text>
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
        />

      </View>
    </GestureHandlerRootView>
  )
}