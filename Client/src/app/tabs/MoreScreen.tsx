import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View, Modal, KeyboardAvoidingView, Platform, FlatList, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { useMemo, useState, useCallback } from "react";
import { useNavigation, StackActions, useFocusEffect } from "@react-navigation/native";
import CountryFlag from "react-native-country-flag";

import { HomeStackNavProp } from "../../models/types/RootStackParamList";
import { WalletApp} from '@/src/store/application/WalletApp';
import {ISaving,IDebt,IMarketDataResponse, IForeignCurrency} from "@/src/models/interface/Entities";
import {createIconAcc} from '@/src/utils/helper';
import { useProvider } from "@/src/hooks/useProvider";
import { Colors, Fonts } from "@/src/constants/theme";
import { formatCurrency } from "@/src/utils/format";
import { COUNTRY_FLAG_MAP } from "@/src/constants/COUNTRY_FLAG_MAP";
import { MarketService } from "@/src/services/ServiceImplement/marketService";
 import { useNotificationStore } from "../../store/application/NotificationStore";
 import { socketService } from "../../services/Socketservice";

interface IUser{
  name:string,
  email:string,
}

export default function MoreScreen() {
  const navigation = useNavigation<HomeStackNavProp>();
  const {signOut, userName, email, id, accessToken} = useProvider();
  const walletApp = useMemo(()=>new WalletApp({ id, accessToken }),[id, accessToken])

  const [user, setUser]=useState<IUser>({name:userName, email:email})
  const [modalVisibe, setModalVisibe] = useState(false);
  const [modalContent, setModalConten]=useState<'sa' | 'de' | 'foc' | 'gol' | 'fe' | ''>('')

  const [savings, setSavings] = useState<ISaving[]>([]);
  const [debts, setDebts] = useState<IDebt[]>([]);

  const [vndAmount, setVndAmount] = useState('');
  const [marketData, setMarketData] = useState<IMarketDataResponse | null>(null);

  
  const iconAcc = createIconAcc(user.name);
  
  const marketService = useMemo(
    () => new MarketService({ id, accessToken }),
    [id, accessToken]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const [walletResult, marketResult] = await Promise.all([
          walletApp.loadWalletScreenData(true),
          marketService.getMarketData(),          
        ]);

        if (walletResult) {
          setSavings(walletResult.rawData.savings);
          setDebts(walletResult.rawData.debts);
        }
        if (marketResult) setMarketData(marketResult);
      };
      fetchData();
    }, [])
  );


  const renderMenuItem = (icon: any, title: string, onPress:any, lib:'m'|'md'='m', showChevron = true) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {lib==='m'?<MaterialIcons name={icon} size={22} color={Colors.light.textSub} style={styles.menuIcon} />
        : <MaterialDesignIcons name={icon} size={22} color={Colors.light.textSub} style={styles.menuIcon}/>}
        <Text style={styles.menuText}>{title}</Text>
      </View>
      {showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.light.placeholder} />
      )}
    </TouchableOpacity>
  );
  const renderHeader = ()=>{
    switch(modalContent){
      case 'sa':
        return 'All your savings';
      case 'de':
        return 'All your debts';
      case 'foc':
        return 'Foreign currency';
      case 'gol':
        return 'Domestic gold price';
      case 'fe':
        return 'Feedback';
      default: return '';
    }
  }

  const renderSavingList = ()=>(
     savings?.map(item=>(
                 <TouchableOpacity 
                  key={item.id}
                  style={styles.savingsCard}
                >
                  <View style={styles.savingsTop}>
                    <View style={styles.savingsIconBox}>
                      <MaterialIcons name='savings' size={20} color="#12D0FF"/>
                    </View>
                    <View style={styles.savingsNameBox}>
                      <Text style={styles.savingsName}>{item.name}</Text>
                      <Text style={styles.savingsTarget}>Target: {formatCurrency(item.target, {absolute:true})}</Text>
                    </View>
                    <View style={styles.rightActionCol}>
                       <Text style={styles.savingsBalance}>{formatCurrency(item.balance, {absolute:true})}</Text>
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
            ))
  )
  const renderDebtList = ()=>(
    debts?.map((item)=>{
                const isLoanFrom = item.type === "loan_from";
                const mainColor = isLoanFrom ? '#059669' : '#d90000';
                const bgColor = isLoanFrom ? '#05966915' : '#d9000015';
                return(
                <TouchableOpacity
                  key={item.id}
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
                        {formatCurrency(item.remaining, {absolute:true})}
                      </Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.textAmountLabel}>Total</Text>
                      <Text style={styles.totalAmountSmall}>
                        {`${item.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )})
  )
  const renderForeignCurrency = () => {
    const currencies = marketData?.foreignCurrencies ?? [];
    const inputVND = parseFloat(vndAmount.replace(/\./g, '')) || 0;

    const renderItem = ({ item }: { item: IForeignCurrency }) => {
      // Tính số ngoại tệ nhận được khi đổi từ VND
      const converted = inputVND > 0
        ? (inputVND / item.rate).toFixed(4)
        : '1';

      const displayAmount = inputVND > 0
        ? `${converted} ${item.foreignCurrency}`
        : `1 ${item.foreignCurrency}`;

      const isoCode = COUNTRY_FLAG_MAP[item.country] ?? 'UN';

      return (
        <View style={fStyles.currencyItem}>
          <View style={fStyles.leftCol}>
            <Text style={fStyles.amountText}>{displayAmount}</Text>
            <Text style={fStyles.rateText}>{`1 ${item.foreignCurrency} ≈ ${item.rate.toLocaleString('vi-VN')} VND`}</Text>
          </View>
          <View style={fStyles.rightCol}>
            <CountryFlag isoCode={isoCode} size={28} style={fStyles.flag} />
            <Text style={fStyles.countryText}>{item.country}</Text>
          </View>
        </View>
      );
    };

    return (
      <View style={fStyles.container}>
        {/* Input VND */}
        <View style={fStyles.inputRow}>
          <TextInput
            style={fStyles.input}
            placeholder="Nhập số tiền VND"
            keyboardType="numeric"
            value={vndAmount}
            onChangeText={(val) => {
              // Format số có dấu chấm ngăn cách
              const raw = val.replace(/\./g, '');
              if (!isNaN(Number(raw))) {
                const formatted = Number(raw).toLocaleString('vi-VN');
                setVndAmount(formatted === '0' ? '' : formatted);
              }
            }}
          />
          <View style={fStyles.vndBadge}>
            <CountryFlag isoCode="VN" size={18} />
            <Text style={fStyles.vndText}>VND</Text>
          </View>
        </View>

        {/* Updated at */}
        {marketData?.updatedAt && (
          <Text style={fStyles.updatedAt}>
            {`Cập nhật: ${new Date(marketData.updatedAt).toLocaleTimeString('vi-VN')}`}
          </Text>
        )}

        {/* Danh sách tỉ giá */}
        <FlatList
          data={currencies}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false} // ScrollView cha đã handle scroll
          ItemSeparatorComponent={() => <View style={fStyles.separator} />}
        />
      </View>
    );
  };
  const renderGoldPrice = () => {
    const goldPrices = marketData?.goldPrices ?? [];

    return (
      <View style={gStyles.container}>
        {/* Updated at */}
        {marketData?.updatedAt && (
          <Text style={gStyles.updatedAt}>
            {`Cập nhật: ${new Date(marketData.updatedAt).toLocaleTimeString('vi-VN')}`}
          </Text>
        )}

        {/* Table header */}
        <View style={gStyles.headerRow}>
          <Text style={[gStyles.headerText, { flex: 2 }]}>Thương hiệu</Text>
          <Text style={[gStyles.headerText, { flex: 1, textAlign: 'center' }]}>Mua vào</Text>
          <Text style={[gStyles.headerText, { flex: 1, textAlign: 'right' }]}>Bán ra</Text>
        </View>

        {/* Danh sách giá vàng */}
        {goldPrices.map((item, index) => (
          <View
            key={item.id}
            style={[gStyles.row, index % 2 === 0 ? gStyles.rowEven : gStyles.rowOdd]}
          >
            <View style={[{ flex: 2 }, gStyles.brandCol]}>
              <MaterialDesignIcons name="gold" size={16} color="#F59E0B" />
              <Text style={gStyles.brandText} numberOfLines={1}>{item.type}</Text>
            </View>
            <Text style={[gStyles.buyText, { flex: 1, textAlign: 'center' }]}>
              {(item.buyPrice).toLocaleString('vi-VN')}K
            </Text>
            <Text style={[gStyles.sellText, { flex: 1, textAlign: 'right' }]}>
              {(item.sellPrice).toLocaleString('vi-VN')}K
            </Text>
          </View>
        ))}

        {/* Ghi chú đơn vị */}
        <Text style={gStyles.note}>* Đơn vị: nghìn đồng / chỉ vàng</Text>
      </View>
    );
  };


  const handleSignOut = ()=>{
    Alert.alert("Sign out", "Are you sure to sign ut?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut(); // ← đợi clear xong
          socketService.disconnect();
          useNotificationStore.getState().clearAll();
          navigation.dispatch(StackActions.replace("LayoutAuth"));
        },
      },
    ]);
  }


  return (
    <View style={styles.container}>
      {/* ===== HEADER BACKGROUND ===== */}
      <View style={styles.headerBg} />

      <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.navBar}>
          <View style={{width:50}}/>
          <Text style={styles.navTitle}>Setting</Text>
          <View style={styles.version}>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}> 
          <View style={[styles.card, styles.shadow]}>
            <View style={styles.acc}>
              <View style={styles.icon}>
                <Text style={styles.iconText}>{iconAcc}</Text>
              </View>
              <View style={styles.infor}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.phone}>{user.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={()=>handleSignOut()}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 10, paddingBottom: 10,  }}>
            <Text style={{ fontWeight: "600", fontSize: 14, color:'#14cbf9' }}>
              Services
            </Text>
          </View>
          <View style={styles.menuList}>
            {renderMenuItem("category", "Category management", ()=>{
              navigation.navigate("allCategory", {})
            })}
            {renderMenuItem("savings", "Savings activities", ()=>{
              setModalConten('sa')
              setModalVisibe(true)
            })}
            {renderMenuItem("account-cash-outline", "Debts list", ()=>{
              setModalConten('de')
              setModalVisibe(true)
            }, 'md')}
          </View>
          <View style={{ paddingTop: 10, paddingBottom: 10,  }}>
            <Text style={{ fontWeight: "600", fontSize: 14, color:'#14cbf9' }}>
              Utilties
            </Text>
          </View>
          <View style={styles.menuList}>
            {renderMenuItem("currency-exchange", "Foreign currency", ()=>{
              setModalConten('foc')
              setModalVisibe(true)
            })}
            {renderMenuItem("gold", "Domestic gold price",()=>{
              setModalConten('gol')
              setModalVisibe(true)
            }, 'md')}
          </View>
          <View style={{ paddingTop: 10, paddingBottom: 10,  }}>
            <Text style={{ fontWeight: "600", fontSize: 14, color:'#14cbf9' }}>
              Feedback
            </Text>
          </View>
          <View style={styles.menuList}>
            {renderMenuItem("feedback", "Feedback", ()=>{
              setModalConten('fe')
              setModalVisibe(true)
            })}
          </View>
        </ScrollView>

        <Modal
          visible={modalVisibe}
          animationType="fade"
          transparent={true}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View  style={styles.modalContent}>
              {/* Header  */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{renderHeader()}</Text>
                <TouchableOpacity onPress={()=>setModalVisibe(false)}>
                  <MaterialIcons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {modalContent==='sa' && renderSavingList()}
                {modalContent==='de' && renderDebtList()}
                {modalContent === 'foc' && renderForeignCurrency()}
                {modalContent === 'gol' && renderGoldPrice()}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
    height: 180,
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Fonts.rounded,
  },

  version:{
    textAlign:'right',
    width:50,
  },
  versionText:{
    fontSize:12,
    fontWeight:'400',
    color:'#fff'
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
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  acc:{
    flex:1,
    flexDirection:'row', 
    gap:7, 
    alignItems:'center',
    marginBottom:20
  },
  icon:{
    width:45,
    height:45,
    borderRadius:50,
    borderWidth:3,
    borderStyle:'solid',
    borderColor:Colors.light.primary,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#fff',
  },
  iconText:{
    fontSize:20,
    fontWeight:'700',
    color:Colors.light.primary,
  },
  infor:{

  },
  userName:{
    fontWeight:'700',
    fontSize:16,
  },
  phone:{
    fontWeight:'500',
    fontSize:14,
  },
  signOutBtn:{
    borderRadius:12,
    backgroundColor:Colors.light.primary,
    alignItems:'center',
    justifyContent:'center',
    paddingVertical:10
  },
  signOutText:{
    color:'#fff',
    fontSize:18,
    fontWeight:'600',
  },


  menuList: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderInput,
    marginBottom:12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderInput,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: Colors.light.textMain,
    fontWeight: '500',
  },

  //===============SAVING
  rightActionCol: {
    alignItems: 'flex-end',
  },
  savingsCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eeefef',
  },
  savingsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savingsNameBox: {
    flex: 1,
  },
  savingsName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  savingsTarget: {
    fontSize: 11,
    color: '#64748B',
  },
  savingsBalance: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  savingsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  //======================DEBT
  debtItem: {
    flexDirection: 'row',
      padding: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: '#fff', 
      marginBottom: 12,
      borderColor:'#eeefef',
      borderWidth:1
  },
  leftInfor: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Chiếm không gian bên trái
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    nameContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    loanName: {
      fontSize: 12,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    partnerNameText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1e293b',
      marginVertical: 2,
    },
     timeLoan: {
      fontSize: 11,
      color: '#94a3b8',
    },
    rightInforWrapper: {
      alignItems: 'flex-end',
      gap: 4,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    textAmountLabel: {
      fontSize: 10,
      color: '#94a3b8',
      fontWeight: '500',
    },
    loanAmount: {
      fontSize: 16,
      fontWeight: '800',
    },
    totalAmountSmall: {
      fontSize: 13,
      fontWeight: '600',
      color: '#64748b',
    },

    //======================MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex:11,
      },
      modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '90%',
      },
      modalHeader: {
        flexDirection:'row', 
        justifyContent: 'space-between',
        alignItems:'center',
        marginBottom:20
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
      },
})

const fStyles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1E293B',
  },
  vndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  vndText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  updatedAt: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
    textAlign: 'right',
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  leftCol: {
    flex: 1,
    gap: 4,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  rateText: {
    fontSize: 12,
    color: '#64748B',
  },
  rightCol: {
    alignItems: 'center',
    gap: 4,
  },
  flag: {
    borderRadius: 4,
  },
  countryText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 80,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
const gStyles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  updatedAt: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
    textAlign: 'right',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F59E0B20',
    borderRadius: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rowEven: {
    backgroundColor: '#FFFBEB',
  },
  rowOdd: {
    backgroundColor: '#ffffff',
  },
  brandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  buyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  sellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  note: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});