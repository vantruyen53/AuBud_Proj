import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useProvider } from "../../hooks/useProvider";
import { formatCurrency } from "../../utils/format";
import { SwipeListView } from "react-native-swipe-list-view";
import { HomeStackNavProp } from "../../models/types/RootStackParamList";
import { IWallet, IDebtMaster, IGroupFund, ISaving } from '../../models/IApp';
import mockGroupFund from '../../store/seed/groupFunds';
import mockWallets from '../../store/seed/wallets';
import mockSaving from '../../store/seed/saving';
import { mockDebts } from '../../store/seed/debt';
import styles from '../../assets/styles/walletStyle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Eye, EyeOff } from "lucide-react-native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { ModalForm } from '../../components/customModal';

export default function WalletScreen() {
  // Quản lý trạng thái hiển thị số tiền (ẩn/hiện)
  const { isShowData, toggleShowData } = useProvider();
  
  // Dữ liệu cho các loại tài sản
  const [wallets, setWallets] = useState<IWallet[]>(mockWallets);
  const [savings, setSavings] = useState<ISaving[]>(mockSaving);
  const [groupFunds, setGroupFunds] = useState<IGroupFund[]>(mockGroupFund);
  const [debts, setDebts] = useState<IDebtMaster[]>(mockDebts);

  // Các trạng thái quản lý Modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'wallet' | 'saving' | 'group' | 'debt' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [typeAction, setTypeAction]=useState<'add' | 'edit'>('add')

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Total amount 
  // Tính toán tổng giá trị tài sản
  const walletTotal = useMemo(()=>{
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  },[wallets])
  const savingsTotal = useMemo(()=>{
    return savings.reduce((sum, s) =>  sum + s.balance, 0);
  },[savings])
  const groupTotal =useMemo(()=> groupFunds.reduce((sum, g) => sum + g.balance, 0),[groupFunds])
  
  // Tổng cộng tất cả tài sản
  const totalAssets = useMemo(()=>{return walletTotal+savingsTotal+groupTotal}, [walletTotal,savingsTotal,groupTotal])
  
  // Tính toán tổng nợ và cho vay
  const totalDebts = useMemo(() => {
    return debts.filter(d => d.type === 'loan_from').reduce((sum, d) => sum + d.remaining, 0);
  }, [debts]);
  const totalLending = useMemo(() => {
    return debts.filter(d => d.type === 'loan_to').reduce((sum, d) => sum + d.remaining, 0);
  }, [debts]);

  const handleDelete = (type: string, id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            if (type === 'wallet') setWallets(prev => prev.filter(item => item.id !== id));
            if (type === 'saving') setSavings(prev => prev.filter(item => item.id !== id));
            if (type === 'group') setGroupFunds(prev => prev.filter(item => item.id !== id));
            if (type === 'debt') setDebts(prev => prev.filter(item => item.id !== id));
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const openModal = (type: 'wallet' | 'saving' | 'group' | 'debt', item: any = null, typeAction:'edit'|'add') => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || getInitialFormData(type));
    setModalVisible(true);
    setTypeAction(typeAction)
  };

  const getInitialFormData = (type: string) => {
    switch(type) {
      case 'wallet': return { name: '', balance: '0'};
      case 'saving': return { name: '', balance: '0', target: '0', icon: 'car-outline' };
      case 'group': return { name: '', balance: '0', members: '1', icon: 'home-group' };
      case 'debt': return { name: '', amount: '0', remaining: '0', type: 'borrow', to_other: '' };
      default: return {};
    }
  };

  const handleSave= ()=>{}


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

              <Text style={styles.totalAmount}>{isShowData ? formatCurrency(totalAssets, {absolute:true}) : '******'}</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wallets</Text>
              <View style={styles.sectionTotal}>
                <Text style={styles.headerLabel}>Total:</Text>
                <Text style={styles.headerValue}>{isShowData ? formatCurrency(walletTotal, {absolute:true}) : '******'}</Text>
              </View>
            </View>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Group funds</Text>
              <View style={styles.sectionTotal}>
                <Text style={styles.headerLabel}>Total:</Text>
                <Text style={styles.headerValue}>{isShowData ? formatCurrency(groupTotal, {absolute:true}) : '******'}</Text>
              </View>
            </View>
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
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupBalance}>{isShowData ? formatCurrency(item.balance, {absolute:true}) : '******'}</Text>
                  <View style={styles.groupMembers}>
                    <MaterialIcons name="person" size={12} color="#94A3B8" />
                    <Text style={styles.groupMembersText}>{item.members} member</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Savings Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings</Text>
              <View style={styles.sectionTotal}>
                <Text style={styles.headerLabel}>Total:</Text>
                <Text style={styles.headerValue}>{isShowData ? formatCurrency(savingsTotal, {absolute:true}) : '******'}</Text>
              </View>
            </View> 
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
                     <Text style={[styles.progressText, {color: '#64748B'}]}>Remaining: {formatCurrency(item.target - item.balance, {absolute:true})}</Text>
                  </View>
                </TouchableOpacity>
            ))}

            {/* Debts Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Debts & Loan</Text>
              <View>
                <View style={styles.sectionTotal}>
                  <Text style={styles.headerLabel}>Total debts:</Text>
                  <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalDebts, {absolute:true}) : '******'}</Text>
                </View>
                <View style={styles.sectionTotal}>
                  <Text style={styles.headerLabel}>Total loan:</Text>
                  <Text style={styles.headerValue}>{isShowData ? formatCurrency(totalLending, {absolute:true}) : '******'}</Text>
                </View>
              </View>
            </View>
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
                      <Text style={styles.timeLoan}>{item.createAt}</Text>
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
        />

      </View>
    </GestureHandlerRootView>
  )
}