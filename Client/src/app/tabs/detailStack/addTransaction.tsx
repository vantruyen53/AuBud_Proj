import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState, useMemo, useEffect, use } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";

//Config
import { useNavigation } from "@react-navigation/native";
import { HomeStackNavProp } from "../../../models/types/RootStackParamList";
import styles from "@/src/assets/styles/addTransactionStyle";
import { useProvider } from "@/src/hooks/useProvider";

//Custom
import {
  ModalWallet,
  ModalDebts,
  ModalSaving,
  ModalCategoryName,
} from "@/src/components/customModal";
import { dateFormat, toDateTimeFormat } from "@/src/utils/format";
import Calendar from "@/src/components/calendar";
import TypeDebt from "@/src/components/typeDebts";
import {
  IDateState,ICategory,
} from "@/src/models/interface/Entities";
import { extractTransaction } from "@/src/utils/helper";
import { toInitialFormatCurrency } from "@/src/utils/format";
import {
  DebtTransactionDTO,
  SavingTransactionDTO,
  ConvertDTO,
  CreateTransactionDTO,CategoryDTO
} from "@/src/models/interface/DTO";

import { useAudioPlayer } from 'expo-audio';

//Application
import { TransactionApp } from "@/src/store/application/TransactionApp";
import { WalletApp } from "@/src/store/application/WalletApp";
import { CategoryApp } from "@/src/store/application/CategoryApp";


const transactionSuccessAudio = require('@/src/assets/audio/transactionSuccessAudio.mp3');

export default function AddTransactionScreen({route}:any) {
  const navigation = useNavigation<HomeStackNavProp>();
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  const player = useAudioPlayer(transactionSuccessAudio);
  const {hanldeType, payLoad}= route.params;

  const { id, accessToken, walletScreen, refreshWallet } = useProvider();
  const walletApp = new WalletApp({ id: id, accessToken: accessToken });
  const categoryApp = new CategoryApp({id, accessToken})
  const tractionApp = new TransactionApp({ id: id, accessToken: accessToken });

  //DATA
  const wallets = useMemo(() => walletScreen?.rawData.wallets || [], [walletScreen]);
  const savings = useMemo(() => walletScreen?.rawData.savings || [], [walletScreen]);
  const debts = useMemo(()=>walletScreen?.rawData.debts || [], [walletScreen])

  //HANLDE
  const [actionType, setActionType] = useState<"Income" | "Sending" | "Debt" | "Saving" | "Convert">(
    payLoad?.type==='income'?"Income":"Sending");
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO>({
    id: "",
    name: "",
    type: "",
    iconName: "",
    iconColor: "",
  });
  const [formData, setFormData] = useState<Record<string, string>>(() => ({
    id:payLoad?.id ?? '',
    amount: payLoad?.amount?.toString() ?? '',
    title: payLoad?.title ?? '',
    categoryId: payLoad?.category?.id ?? '',
    walletId: payLoad?.walletId ?? '',
    note: payLoad?.note ?? '',
    date: payLoad?.date ?? `${year}-${month}-${day}`,
    type: payLoad?.type ?? actionType,
    walletName:payLoad?.wallet ??'',
    budgetId:payLoad?.budgetId ??'',
    userId:payLoad?.userId ??'',
    status:payLoad?.status ??'completed',
  }));
  const [specificTime, setSpecificTime] = useState<IDateState>(() => {
    if (payLoad?.date) {
      const d = new Date(payLoad.date); 
      return {
        y: d.getFullYear().toString(),
        m: (d.getMonth() + 1).toString(),
        d: d.getDate().toString(),
      };
    }
    // Không có payLoad thì dùng ngày hiện tại
    return {
      y: year.toString(),
      m: month.toString(),
      d: day.toString(),
    };
  });
  const [modalTarget, setModalTarget] = useState<"primary" | "convert_to">("primary",);

  const [listSending, setListSending] = useState<ICategory[]>([]);
  const [listIncome, setListIncome] = useState<ICategory[]>([]);

  //SELETED DATA
  const [debtSelected, setDebtSelected] = useState<{partnerName:string, remaining:number}>({partnerName:"", remaining:0});
  const [walletSelected, setWalletSelected] = useState<{walletId:string,walletName:string, balance:number}>(
    {walletId:payLoad?.walletId??'',walletName:payLoad?.walletId??'', balance:0});
  const [savingSelected, setSavingSelected] = useState<{savingName:string, balance:number}>({savingName:"", balance:0});
  const [walletTo, setWalletTo] = useState<{walletName:string, balance:number}>({walletName:"", balance:0});
  //UPDATE
  const [oldWallet, setOldWallet] = useState<{oldWalletId:string,oldWalletName:string, oldBalance:number}>(
    {oldWalletId:payLoad?.walletId??'',oldWalletName:payLoad?.walletId??'', oldBalance:0});

  //MODAL VIEW
  const [isOpenWallets, setIsOpenWallets] = useState(false);
  const [isOpenTypeDebts, setIsOpenTypeDebts] = useState(false);
  const [isOpenListDebts, setIsOpenListDebts] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [isOpenSaving, setIsOpenSaving] = useState(false);
  const [isOpenCatNameInput, setIsOpenCatNameInput] = useState(false);

  const handleCreatedAt = toDateTimeFormat(
    specificTime.y,
    specificTime.m,
    specificTime.d,
  );

  useEffect(() => {
    const fetchData = async () => {
      const categoryData= await categoryApp.getSuggestedCategory();
      if (categoryData) {
        setListSending(categoryData.catSending)
        setListIncome(categoryData.catIncome)
      }
    };
    fetchData();
    setFormData({ ...formData, createdAt: handleCreatedAt });
  }, []);

  const categories =actionType === "Sending"? listSending:listIncome;

  const handleDateSelect = (year: number, m: number, d: number) => {
    setSpecificTime({ y: year.toString(), m: m.toString(), d: d.toString() });
  };
  const convertFormat = (amount: string) => {
    const cleanNumber = amount.replace(/\D/g, "");
    return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const hanlderFilterDebts = useMemo(()=>{
    if(formData.debtType==="repay_to"){
      return debts.filter(d=>d.type==='loan_from')
    }else{
      return debts.filter(d=>d.type==='loan_to')
    }
  }, [formData.debtType, ])

  const clearForm = () => {
    setFormData({});
    setSpecificTime({y: year.toString(),m: month.toString(),d: day.toString(),});
    setModalTarget("primary");
    setWalletTo({walletName:"", balance:0});
    setSavingSelected({savingName:"", balance:0});
    setWalletSelected({walletId:'',walletName:"", balance:0});
    setDebtSelected({partnerName:"", remaining:0});
  };

  const handleSave = async () => {
    if(hanldeType==="edit"){
      setFormData({...formData, createdAt:handleCreatedAt})
      const result = await tractionApp.updateTransaction(formData, oldWallet, 
        {newWalletId:walletSelected.walletId, newBalance:walletSelected.balance-parseInt(formData.amount)}
      )
      if (result){
        clearForm();
        navigation.goBack();
      };
    }else{
      formData["createdAt"] = handleCreatedAt;
      const e = extractTransaction(actionType, formData, id);
      if (e)
        try {
          if (actionType === "Sending" || actionType === "Income") {
            const payLoad = e as CreateTransactionDTO;
            const result = await tractionApp.addTransaction(payLoad, walletSelected.balance);
            if (result){
              clearForm()
            };
          } 
          else if (actionType === "Debt" || actionType === "Saving") {
            const payLoad = e as DebtTransactionDTO | SavingTransactionDTO;
            const remaingOrBalance = actionType === "Debt"?debtSelected.remaining:savingSelected.balance;
            const result = await walletApp.addWalletTransaction(
              payLoad,walletSelected.balance,remaingOrBalance
            );
            if (result){
              clearForm()
            };
          } 
          else {
            const payLoad = e as ConvertDTO;
            const result = await walletApp.convertBalance(payLoad, walletSelected.balance, walletTo.balance);
            if (result){
              clearForm()
            };
          }

          player.seekTo(0);
          player.play();

          await refreshWallet(id, accessToken)
        } catch (err) {
          Alert.alert("Error", `Something went wrong ${err}`);
        }
      else Alert.alert("Error", "All field required");
    }
  };

  //LOAD DATA FOR EDITTING
  payLoad && useEffect(()=>{
    const wallet = wallets.find(w => w.id===payLoad?.walletId)
    const backupBalance = wallet?.balance+payLoad?.amount;

    setWalletSelected({walletId:wallet?.id as string, balance:backupBalance, walletName:wallet?.name as string})
    setOldWallet({oldWalletId:wallet?.id as string, oldBalance:backupBalance, oldWalletName:wallet?.name as string})
  }, [payLoad,wallets])

  const renderSenInForm = () => (
    <View style={styles.form}>
      <View style={styles.detailCat}>
        <Text
          style={formData.title ? styles.detailCatText : styles.placeHolderWallet}
        >
          {formData.title ? formData.title : "Detail transaction name"}
        </Text>
        {formData.title && (
          <TouchableOpacity
            style={styles.detailCatClear}
            onPress={() => setFormData({...formData, title:""})}
          >
            <MaterialIcons name="close" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Text style={{ fontWeight: "600", fontSize: 18, color: "#12D0FF" }}>
          Recomment
        </Text>
        <MaterialDesignIcons name="creation" size={20} color="#12D0FF" />
      </View>
      <View style={styles.gridContainer}>
        {categories?.map((cat) => (
          <View key={cat.id} style={{ width: "25%" }}>
            <TouchableOpacity
              key={cat.id}
              style={styles.catItem}
              onPress={() => {
                setSelectedCategory({
                  id: cat.id,
                  name: cat.name,
                  type: cat.type,
                  iconName: cat.iconName,
                  iconColor: cat.iconColor,
                });
                setFormData({...formData, categoryId:cat.id})
                setIsOpenCatNameInput(true);
              }}
            >
              <View
                style={[
                  styles.catIconBg,
                  { backgroundColor: `rgba(${cat.iconColor},0.1)` },
                  selectedCategory.id === cat.id && styles.catIconBgSelected,
                ]}
              >
                <MaterialIcons
                  name={cat.iconName as any}
                  size={28}
                  color={`rgb(${cat.iconColor})`}
                />
              </View>
              <Text
                style={[
                  styles.catName,
                  selectedCategory.id === cat.id && styles.catNameSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.moreBtn}
        onPress={() =>
          navigation.navigate("allCategory", {
            typePar: actionType,
            setIsOpenCatNameInput: (status: boolean) =>
              setIsOpenCatNameInput(status),
            setSelectedCategory: (categorie: CategoryDTO) =>{
              setSelectedCategory(categorie);
              console.log('=============setSelectedCategory: ', categorie)
              setFormData({...formData, categoryId:categorie.id})
            }
          })
        }
      >
        <Text style={styles.moreText}>More</Text>
        <MaterialDesignIcons
          name="chevron-double-right"
          size={15}
          style={{ color: "#006c87" }}
        />
      </TouchableOpacity>
    </View>
  );
  const renderDebtForm = () => (
    <View style={styles.form}>
      <TouchableOpacity
        onPress={() => setIsOpenTypeDebts(true)}
        style={styles.inforInput}
      >
        <View
          style={[styles.icon, { backgroundColor: "#05966920", padding: 7 }]}
        >
          <MaterialDesignIcons name="hand-coin" size={24} color="#059669" />
        </View>
        <Text
          style={
            formData?.debtType ? styles.walletName : styles.placeHolderWallet
          }
        >
          {formData?.debtType === "repay_to"
            ? "Repay to"
            : formData?.debtType === "repay_from"
              ? "Repay from"
              : "Type of debt"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsOpenListDebts(true)}
        style={styles.inforInput}
      >
        <View
          style={[styles.icon, { backgroundColor: "#05966920", padding: 7 }]}
        >
          <MaterialDesignIcons name="account-cash" size={24} color="#059669" />
        </View>
        <Text
          style={debtSelected.partnerName ? styles.walletName : styles.placeHolderWallet}
        >
          {debtSelected.partnerName ? debtSelected.partnerName : "Partner"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const renderSavingg = () => (
    <View style={styles.form}>
      <TouchableOpacity
        onPress={() => setIsOpenSaving(true)}
        style={styles.inforInput}
      >
        <View
          style={[styles.icon, { backgroundColor: "#05966920", padding: 7 }]}
        >
          <MaterialDesignIcons name="hand-coin" size={24} color="#059669" />
        </View>
        <Text
          style={savingSelected.savingName ? styles.walletName : styles.placeHolderWallet}
        >
          {savingSelected.savingName ? savingSelected.savingName : "Select a saving"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const renderConvert = () => (
    <View style={styles.form}>
      {/* from wallet  */}
      <TouchableOpacity
        onPress={() => {
          (setIsOpenWallets(true), setModalTarget("primary"));
        }}
        style={styles.inforInput}
      >
        <View style={styles.icon}>
          <MaterialIcons
            name="account-balance-wallet"
            size={25}
            color="#6B7280"
          />
        </View>
        <Text
          style={
            walletSelected.walletName ? styles.walletName : styles.placeHolderWallet
          }
        >
          {
            walletSelected.walletName ? walletSelected.walletName : "From"
          }
        </Text>
      </TouchableOpacity>

      {/* to wallet  */}
      <TouchableOpacity
        onPress={() => {
          (setModalTarget("convert_to"), setIsOpenWallets(true));
        }}
        style={styles.inforInput}
      >
        <View style={styles.icon}>
          <MaterialIcons
            name="account-balance-wallet"
            size={25}
            color="#6B7280"
          />
        </View>
        <Text style={walletTo.walletName ? styles.walletName : styles.placeHolderWallet}>
          {walletTo.walletName ? walletTo.walletName : "To Wallet"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, padding: 16 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="#12D0FF" />
          </TouchableOpacity>
          <View style={styles.typeAction}>
            <TouchableOpacity
              style={[
                styles.typeItem,
                actionType === "Sending" ? styles.typeItemAction : null,
              ]}
              onPress={() => {setActionType("Sending"),clearForm()}}
            >
              <MaterialDesignIcons
                name="cash-minus"
                size={24}
                style={
                  actionType === "Sending"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {actionType === "Sending" && (
                <Text style={styles.typeTex}>Sending</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                actionType === "Income" ? styles.typeItemAction : null,
              ]}
              onPress={() => {
                setActionType("Income"),
                setFormData({ ...formData, actionType: actionType })
                clearForm();
              }}
            >
              <MaterialDesignIcons
                name="cash-plus"
                size={20}
                style={
                  actionType === "Income"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {actionType === "Income" && (
                <Text style={styles.typeTex}>Income</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                actionType === "Debt" ? styles.typeItemAction : null,
              ]}
              onPress={() => {setActionType("Debt"),clearForm()}}
            >
              <MaterialDesignIcons
                name="account-cash"
                size={20}
                style={
                  actionType === "Debt"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {actionType === "Debt" && (
                <Text style={styles.typeTex}>Debt</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                actionType === "Saving" ? styles.typeItemAction : null,
              ]}
              onPress={() => {setActionType("Saving"),clearForm()}}
            >
              <MaterialIcons
                name="savings"
                size={20}
                style={
                  actionType === "Saving"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {actionType === "Saving" && (
                <Text style={styles.typeTex}>Saving</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                actionType === "Convert" ? styles.typeItemAction : null,
              ]}
              onPress={() => {setActionType("Convert"),clearForm()}}
            >
              <MaterialIcons
                name="autorenew"
                size={20}
                style={
                  actionType === "Convert"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {actionType === "Convert" && (
                <Text style={styles.typeTex}>Convert</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Amount  */}
          <View style={styles.form}>
            <Text style={styles.amountText}>Amount</Text>
            <TextInput
              placeholder="Example 300.000"
              style={styles.amountInput}
              keyboardType="numeric"
              onChangeText={(val) => setFormData({ ...formData, amount: toInitialFormatCurrency(val) })}
              value={convertFormat(formData?.amount ?? "")}
              placeholderTextColor="#c9c9c9"
            />
          </View>

          {(actionType === "Sending" || actionType === "Income") &&
            renderSenInForm()}
          {actionType === "Debt" && renderDebtForm()}
          {actionType === "Saving" && renderSavingg()}
          {actionType === "Convert" && renderConvert()}
          {/* Infor  */}
          <View style={styles.form}>
            {actionType !== "Convert" && (
              <TouchableOpacity
                onPress={() => setIsOpenWallets(true)}
                style={styles.inforInput}
              >
                <View style={styles.icon}>
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={25}
                    color="#6B7280"
                  />
                </View>
                <Text
                  style={
                    formData.walletName
                      ? styles.walletName
                      : styles.placeHolderWallet
                  }
                >
                  {formData.walletName ? formData.walletName : "Select a wallet"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setIsOpenCalendar(!isOpenCalendar)}
              style={styles.inforInput}
            >
              <View style={styles.icon}>
                <MaterialIcons
                  name="calendar-today"
                  size={25}
                  color="#6B7280"
                />
              </View>
              <Text style={styles.selecteTimeText}>
                {dateFormat(
                  parseInt(specificTime.d),
                  parseInt(specificTime.m),
                  parseInt(specificTime.y),
                )}
              </Text>
            </TouchableOpacity>

            <View style={styles.inforInput}>
              <View style={styles.icon}>
                <MaterialIcons name="notes" size={25} color="#6B7280" />
              </View>
              <TextInput
                placeholder="Note for your transaction"
                style={{ fontWeight: "500", fontSize: 16 }}
                placeholderTextColor="#ddd"
                value={formData.note ?? ''}
                onChangeText={(val) =>{setFormData({ ...formData, note: val })}}
              />
            </View>
            <View></View>
          </View>
          {/* Save btn  */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>

        {isOpenWallets && (
          <ModalWallet
            onPressClose={() => {
              setIsOpenWallets((pre) => !pre);
            }}
            data={wallets}
            walletSelected={
              modalTarget === "primary"
                ? formData.walletId
                : formData.toWalletId
            }
            onSelected={(id: string, name: string,balance: number) => {
              if (modalTarget === "primary") {
                setWalletSelected({walletId:id,walletName:name, balance});
                setFormData({ ...formData, walletId: id,walletName:name });
              } else {
                // Kiểm tra tránh chọn trùng ví nguồn
                if (id === formData.walletId) {
                  alert(
                    "The receiving wallet address must not be the same as the sending wallet address!",
                  );
                  return;
                }
                setWalletTo({walletName:name, balance});
                setFormData({ ...formData, toWalletId: id });
              }
            }}
          />
        )}
        {isOpenCalendar && (
          <Calendar
            onPress={(year: number, m: number, d: number) =>{
              handleDateSelect(year, m, d)
              setFormData({...formData, createdAt:toDateTimeFormat(year.toString(), m.toString(),d.toString())})
            }}
            onPressClose={() => setIsOpenCalendar((pre) => !pre)}
            specificTime={specificTime}
          />
        )}
        {isOpenTypeDebts && (
          <TypeDebt
            isSelected={formData?.debtType}
            onSelecte={(type: string) => {
              setFormData({ ...formData, debtType: type }),
              setIsOpenTypeDebts(false);
            }}
          />
        )}
        {isOpenListDebts && (
          <ModalDebts
            data={hanlderFilterDebts}
            onPressClose={() => setIsOpenListDebts(!isOpenListDebts)}
            onSelect={(id: string, partnerName: string, remaining: number) => {
              setDebtSelected({partnerName,remaining}),
                setFormData({ ...formData, debtId: id });
            }}
            debt={formData.debtId}
          />
        )}
        {isOpenSaving && (
          <ModalSaving
            data={savings}
            selected={formData.savingId}
            onPressClose={() => setIsOpenSaving(!isOpenSaving)}
            onSelect={(id: string, name: string,balance: number) => {
              (setSavingSelected({savingName:name, balance}),
                setFormData({ ...formData, savingId: id }));
            }}
          />
        )}
        {isOpenCatNameInput && (
          <ModalCategoryName
            cat={selectedCategory}
            onPressClose={() => setIsOpenCatNameInput(false)}
            setDetailCat={(title:string)=>{setFormData({...formData, title:title})}}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
