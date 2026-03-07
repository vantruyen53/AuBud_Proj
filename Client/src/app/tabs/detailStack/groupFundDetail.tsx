import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { ChevronLeft, Plus, Minus, Users, Eye, EyeOff, X, Wallet, Check, Trash2 } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { IGroupFund, IGroupMember, IGroupTransaction, IWallet } from '../../../models/IApp';
import mockGroupMembers from '../../../store/seed/groupFundMembers';
import mockGroupTransactions from '../../../store/seed/groupFundTransactions';
import mockWallets from '../../../store/seed/wallets';
import { Colors } from '../../../constants/theme';
import s from '../../../assets/styles/groupFundDetailStyle';

type ActionType = 'contribute' | 'withdraw' | null;

export default function GroupFundDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fund = (route.params as { fund: IGroupFund }).fund;

  // ===== State =====
  const [showBalance, setShowBalance] = useState(true);
  const [isAddMemberVisible, setAddMemberVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Wallet-picker modal state
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
  const [amountInput, setAmountInput] = useState('');

  const [members, setMembers] = useState<IGroupMember[]>(
    mockGroupMembers.filter(m => m.fundId === fund.id)
  );
  const [transactions, setTransactions] = useState<IGroupTransaction[]>(
    mockGroupTransactions.filter(t => t.fundId === fund.id)
  );

  const formatCurrency = (amount: number) =>
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';

  // ===== Open wallet picker =====
  const openAction = (type: ActionType) => {
    setActionType(type);
    setSelectedWallet(null);
    setAmountInput('');
  };

  const closeAction = () => {
    setActionType(null);
    setSelectedWallet(null);
    setAmountInput('');
  };

  // ===== Confirm contribute / withdraw =====
  const handleConfirmAction = () => {
    if (!selectedWallet) {
      Alert.alert('Chưa chọn ví', 'Vui lòng chọn một ví để thực hiện.');
      return;
    }
    const parsed = parseInt(amountInput.replace(/\./g, ''), 10);
    if (!parsed || parsed <= 0) {
      Alert.alert('Số tiền không hợp lệ', 'Vui lòng nhập số tiền lớn hơn 0.');
      return;
    }
    if (actionType === 'withdraw' && parsed > fund.balance) {
      Alert.alert('Số dư không đủ', 'Quỹ không đủ số dư để rút.');
      return;
    }
    if (actionType === 'contribute' && parsed > selectedWallet.balance) {
      Alert.alert('Số dư ví không đủ', `Ví ${selectedWallet.name} không đủ số dư.`);
      return;
    }

    const label = actionType === 'contribute' ? 'Đóng Góp' : 'Rút Quỹ';
    const newTx: IGroupTransaction = {
      id: Date.now().toString(),
      fundId: fund.id,
      type: actionType!,
      amount: parsed,
      memberName: 'Bạn',
      date: new Date().toISOString().split('T')[0],
      note: `Từ ví ${selectedWallet.name}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    closeAction();
    Alert.alert(`✅ ${label} thành công`, `${formatCurrency(parsed)} từ ví ${selectedWallet.name}`);
  };

  // ===== Kiểm tra user hiện tại có phải admin không =====
  // (Giả định: member đầu tiên trong quỹ có role 'admin' là user hiện tại)
  const currentUser = members.find(m => m.role === 'admin');
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  // ===== Xóa thành viên =====
  const handleDeleteMember = (member: IGroupMember) => {
    if (member.role === 'admin') return; // Không xóa được chủ quỹ
    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc muốn xóa "${member.name}" khỏi quỹ?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => setMembers(prev => prev.filter(m => m.id !== member.id)),
        },
      ]
    );
  };

  // ===== Add member =====
  const handleSendInvite = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.trim() || !emailRegex.test(emailInput.trim())) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ Gmail đúng định dạng.');
      return;
    }
    const alreadyExists = members.find(m => m.email === emailInput.trim());
    if (alreadyExists) {
      Alert.alert('Đã tồn tại', 'Thành viên này đã có trong quỹ.');
      return;
    }
    const newMember: IGroupMember = {
      id: Date.now().toString(),
      fundId: fund.id,
      name: emailInput.split('@')[0],
      email: emailInput.trim(),
      role: 'member',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setMembers(prev => [...prev, newMember]);
    setEmailInput('');
    setAddMemberVisible(false);
    Alert.alert('✅ Đã gửi lời mời', `Lời mời đã được gửi tới ${emailInput.trim()}`);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header + Balance merged */}
      <View style={s.headerBg}>
        <View style={s.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={s.headerTitleGroup}>
            <Text style={s.headerTitle}>{fund.name}</Text>
            <Text style={s.headerSubtitle}>Chi tiết quỹ nhóm</Text>
          </View>
        </View>

        <View style={s.headerDivider} />

        {/* Balance section */}
        <View style={s.balanceTopRow}>
          <Text style={s.balanceLabel}>Số dư hiện tại</Text>
          <TouchableOpacity onPress={() => setShowBalance(p => !p)}>
            {showBalance ? <Eye size={18} color="#475569" /> : <EyeOff size={18} color="#475569" />}
          </TouchableOpacity>
        </View>
        <Text style={s.balanceAmount}>
          {showBalance ? formatCurrency(fund.balance) : '••••••'}
        </Text>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => openAction('contribute')}>
            <Plus size={18} color="#FFF" />
            <Text style={s.actionBtnText}>Đóng Góp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => openAction('withdraw')}>
            <Minus size={18} color="#FFF" />
            <Text style={s.actionBtnText}>Rút Quỹ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.content} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Members */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionLeft}>
              <View style={s.sectionIconBox}>
                <Users size={22} color={Colors.light.primary} />
              </View>
              <View>
                <Text style={s.sectionTitle}>Thành Viên</Text>
                <Text style={s.sectionSubtitle}>{members.length} thành viên trong quỹ</Text>
              </View>
            </View>
            <TouchableOpacity style={s.addMemberBtn} onPress={() => setAddMemberVisible(true)}>
              <Plus size={14} color="#FFF" />
              <Text style={s.addMemberBtnText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          <View style={s.membersList}>
            {members.map((member, index) => {
              const canDelete = isCurrentUserAdmin && member.role !== 'admin';

              const renderRightActions = () => (
                <TouchableOpacity
                  style={s.deleteAction}
                  onPress={() => handleDeleteMember(member)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={20} color="#FFF" />
                  <Text style={s.deleteActionText}>Xóa</Text>
                </TouchableOpacity>
              );

              const rowContent = (
                <View
                  style={[
                    s.memberRow,
                    index === members.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={s.memberInitialBox}>
                    <Text style={s.memberInitialText}>
                      {member.name.charAt(member.name.lastIndexOf(' ') + 1)}
                    </Text>
                  </View>
                  <Text style={s.memberName} numberOfLines={1}>{member.name}</Text>
                  {member.role === 'admin' && (
                    <View style={s.adminBadge}>
                      <Text style={s.adminBadgeText}>Chủ Quỹ</Text>
                    </View>
                  )}
                </View>
              );

              return canDelete ? (
                <Swipeable
                  key={member.id}
                  renderRightActions={renderRightActions}
                  overshootRight={false}
                  friction={2}
                >
                  {rowContent}
                </Swipeable>
              ) : (
                <View key={member.id}>{rowContent}</View>
              );
            })}
          </View>
        </View>

        {/* Transaction History */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionLeft}>
              <View style={s.sectionIconBox}>
                <Minus size={20} color={Colors.light.primary} />
              </View>
              <View>
                <Text style={s.sectionTitle}>Lịch Sử Giao Dịch</Text>
                <Text style={s.sectionSubtitle}>{transactions.length} giao dịch gần nhất</Text>
              </View>
            </View>
          </View>

          {transactions.length === 0 ? (
            <Text style={{ color: '#94A3B8', textAlign: 'center', paddingVertical: 20 }}>
              Chưa có giao dịch nào
            </Text>
          ) : (
            transactions.map((tx, index) => {
              const isContribute = tx.type === 'contribute';
              const color = isContribute ? '#10B981' : '#EF4444';
              const bgColor = isContribute ? '#ECFDF5' : '#FEF2F2';
              const sign = isContribute ? '+' : '-';

              return (
                <View key={tx.id} style={[s.txItem, index === transactions.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[s.txIconBox, { backgroundColor: bgColor }]}>
                    {isContribute ? <Plus size={20} color={color} /> : <Minus size={20} color={color} />}
                  </View>
                  <View style={s.txInfo}>
                    <Text style={s.txType}>{isContribute ? 'Đóng Góp' : 'Rút Quỹ'}</Text>
                    <Text style={s.txMember}>{tx.memberName}</Text>
                    {tx.note ? <Text style={[s.txMember, { fontSize: 11, fontStyle: 'italic' }]}>{tx.note}</Text> : null}
                  </View>
                  <View style={s.txRight}>
                    <Text style={[s.txAmount, { color }]}>{sign}{formatCurrency(tx.amount)}</Text>
                    <Text style={s.txDate}>{tx.date}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ===== Wallet Picker Modal ===== */}
      <Modal
        visible={actionType !== null}
        animationType="slide"
        transparent
        onRequestClose={closeAction}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalOverlay}
        >
          <View style={s.modalContent}>
            {/* Modal header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {actionType === 'contribute' ? '💰 Đóng Góp Quỹ' : '💸 Rút Quỹ'}
              </Text>
              <TouchableOpacity onPress={closeAction}>
                <X size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Amount input */}
            <Text style={s.inputLabel}>Số tiền</Text>
            <TextInput
              style={s.input}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />

            {/* Wallet picker */}
            <Text style={s.inputLabel}>Chọn ví</Text>
            <View style={s.walletList}>
              {mockWallets.map(wallet => {
                const isSelected = selectedWallet?.id === wallet.id;
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[s.walletItem, isSelected && s.walletItemSelected]}
                    onPress={() => setSelectedWallet(wallet)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.walletIconBox, isSelected && s.walletIconBoxSelected]}>
                      <Wallet size={18} color={isSelected ? '#FFF' : Colors.light.primary} />
                    </View>
                    <View style={s.walletInfo}>
                      <Text style={[s.walletName, isSelected && s.walletNameSelected]}>
                        {wallet.name}
                      </Text>
                      <Text style={[s.walletBalance, isSelected && s.walletBalanceSelected]}>
                        {formatCurrency(wallet.balance)}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={s.walletCheckBox}>
                        <Check size={14} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm button */}
            <TouchableOpacity style={s.sendBtn} onPress={handleConfirmAction}>
              <Text style={s.sendBtnText}>
                {actionType === 'contribute' ? 'Xác Nhận Đóng Góp' : 'Xác Nhận Rút Quỹ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={closeAction}>
              <Text style={s.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== Add Member Modal ===== */}
      <Modal
        visible={isAddMemberVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddMemberVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalOverlay}
        >
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Thêm Thành Viên</Text>
              <TouchableOpacity onPress={() => setAddMemberVisible(false)}>
                <X size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <Text style={s.inputLabel}>Địa chỉ Gmail</Text>
            <TextInput
              style={s.input}
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={s.sendBtn} onPress={handleSendInvite}>
              <Text style={s.sendBtnText}>Gửi Lời Mời</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={() => { setAddMemberVisible(false); setEmailInput(''); }}>
              <Text style={s.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
