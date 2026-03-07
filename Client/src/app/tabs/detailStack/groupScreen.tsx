import React, { useState } from 'react';
import {
  View, SafeAreaView, StatusBar, TouchableOpacity,
  Text, ScrollView
} from 'react-native';
import { ChevronLeft, Plus, Users, ChevronRight, Wallet, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/theme';
import { IGroupFund } from '../../../models/IApp';
import mockGroupFund from '../../../store/seed/groupFunds';
import { ModalCreateFund } from '../../../components/customModal';
import s from '../../../assets/styles/groupScreenStyle';


export default function GroupScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true); // Hiện/ẩn số dư
  const [funds, setFunds] = useState<IGroupFund[]>(mockGroupFund);

  // Tạo quỹ mới và thêm vào danh sách
  const handleCreateFund = (name: string) => {
    if (!name.trim()) return;
    const newFund: IGroupFund = {
      id: Date.now().toString(),
      name: name.trim(),
      balance: 0,
      members: 1,
    };
    setFunds(prev => [...prev, newFund]);
  };

  const formatCurrency = (amount: number) =>
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.headerBg}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Quỹ Nhóm</Text>
            <Text style={s.headerSubtitle}>Quản lý quỹ chung của bạn</Text>
          </View>
          <TouchableOpacity style={s.createBtn} onPress={() => setModalVisible(true)}>
            <Plus size={18} color={Colors.light.primary} />
            <Text style={s.createBtnText}>Tạo Quỹ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách quỹ */}
      <ScrollView style={s.content} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Các Quỹ Của Bạn</Text>
          <Text style={s.sectionCount}>{funds.length} quỹ</Text>
        </View>

        {funds.map((fund) => (
          <TouchableOpacity
            key={fund.id}
            style={s.card}
            activeOpacity={0.75}
            onPress={() => (navigation as any).navigate('groupFundDetail', { fund })}
          >
            {/* Top row: icon + tên + chevron */}
            <View style={s.cardTop}>
              <View style={s.cardIconBox}>
                <Wallet size={24} color={Colors.light.primary} />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.fundName}>{fund.name}</Text>
                <View style={s.membersRow}>
                  <Users size={12} color="#94A3B8" />
                  <Text style={s.membersText}>{fund.members} thành viên</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#CBD5E1" />
            </View>

            {/* Divider */}
            <View style={s.cardDivider} />

            {/* Bottom row: số dư */}
            <View style={s.cardBottom}>
              <View style={s.balanceRow}>
                <Text style={s.balanceLabel}>Số dư hiện tại</Text>
                <TouchableOpacity onPress={() => setShowBalance(prev => !prev)}>
                  {showBalance
                    ? <Eye size={16} color="#94A3B8" />
                    : <EyeOff size={16} color="#94A3B8" />
                  }
                </TouchableOpacity>
              </View>
              <Text style={s.fundBalance}>
                {showBalance ? `${formatCurrency(fund.balance)} ₫` : '••••••'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {funds.length === 0 && (
          <View style={s.emptyBox}>
            <Wallet size={48} color="#CBD5E1" />
            <Text style={s.emptyText}>Chưa có quỹ nào</Text>
            <Text style={s.emptySubText}>Nhấn "Tạo Quỹ" để tạo quỹ đầu tiên</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal tạo quỹ */}
      <ModalCreateFund
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateFund}
      />
    </SafeAreaView>
  );
}

