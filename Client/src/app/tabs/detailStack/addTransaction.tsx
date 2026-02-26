import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { HomeStackNavProp } from "../../../models/types/RootStackParamList";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import styles from "@/src/assets/styles/addTransactionStyle";
import {
  mockCategoriesIncome,
  mockCategoriesSending,
} from "@/src/store/seed/category";
import { mockDebts } from "@/src/store/seed/debt";
import mockSaving from "@/src/store/seed/saving";
import {
  IWallet,
  IDateState,
  IDebtMaster,
  ISaving,
  ICategory,
} from "@/src/models/IApp";
import mockWallets from "@/src/store/seed/wallets";
import {
  ModalWallet,
  ModalDebts,
  ModalSaving,
  ModalCategoryName,
} from "@/src/components/customModal";
import { dateFormat } from "@/src/utils/format";
import Calendar from "@/src/components/calendar";
import TypeDebt from "@/src/components/typeDebts";

export default function AddTransactionScreen() {
  const navigation = useNavigation<HomeStackNavProp>();
  const [typeAction, setTypeAction] = useState<
    "Income" | "Sending" | "Debt" | "Saving" | "Convert"
  >("Sending");
  const [amount, setAmount] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState<ICategory>({
    id: "",
    name: "",
    type: "",
    iconName: "",
    iconColor: "",
  });
  const [isOpenWallets, setIsOpenWallets] = useState(false);
  const [isOpenTypeDebts, setIsOpenTypeDebts] = useState(false);
  const [isOpenListDebts, setIsOpenListDebts] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [isOpenSaving, setIsOpenSaving] = useState(false);
  const [isOpenCatNameInput, setIsOpenCatNameInput] = useState(false);

  const [walletSelected, setWalletSelected] = useState<IWallet>({
    id: "",
    name: "",
    balance: 0,
  });
  const [walletTo, setWalletTo] = useState<IWallet>({
    id: "",
    name: "",
    balance: 0,
  });
  const [detailCat, setDetailCat] = useState("");
  // Cờ để biết Modal đang chọn cho ví nào cho chuyển tiền giữa 2 ví
  const [modalTarget, setModalTarget] = useState<"primary" | "convert_to">(
    "primary",
  );

  const [debt, setDebt] = useState<IDebtMaster>({
    id: "",
    type: "",
    partnerName: "",
    totalAmount: 0,
    remaining: 0,
    status: "active",
    createAt: "",
  });
  const [saving, setSaving] = useState<ISaving>({
    id: "",
    name: "",
    target: 0,
    balance: 0,
  });

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  const categories =
    typeAction === "Sending"
      ? mockCategoriesSending
      : typeAction === "Income"
        ? mockCategoriesIncome
        : null;
  const [specificTime, setSpecificTime] = useState<IDateState>({
    y: year.toString(),
    m: month.toString(),
    d: day.toString(),
  });
  const handleDateSelect = (year: number, m: number, d: number) =>
    setSpecificTime({ y: year.toString(), m: m.toString(), d: d.toString() });

  const convertFormat = (amount: string) => {
    const cleanNumber = amount.replace(/\D/g, "");
    return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderSenInForm = () => (
    <>
      {/* Amount  */}
      <View style={styles.form}>
        <Text style={styles.amountText}>Amount</Text>
        <TextInput
          placeholder="Example 300.000"
          style={styles.amountInput}
          keyboardType="numeric"
          onChangeText={(val) => setAmount(val)}
          value={convertFormat(amount)}
          placeholderTextColor="#c9c9c9"
        />
      </View>

      {/* Category   */}
      <View style={styles.form}>
        <View style={styles.detailCat}>
          <Text
            style={detailCat ? styles.detailCatText : styles.placeHolderWallet}
          >
            {detailCat ? detailCat : "Detail transaction name"}
          </Text>
          {detailCat && (
            <TouchableOpacity
              style={styles.detailCatClear}
              onPress={() => setDetailCat("")}
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
              typePar: typeAction,
              setIsOpenCatNameInput: (status: boolean) =>
                setIsOpenCatNameInput(status),
              setSelectedCategory: (categorie: ICategory) =>
                setSelectedCategory(categorie),
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

      {/* Infor  */}
      <View style={styles.form}>
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
              walletSelected.name !== ""
                ? styles.walletName
                : styles.placeHolderWallet
            }
          >
            {walletSelected.name !== ""
              ? walletSelected.name
              : "Select a wallet"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsOpenCalendar(!isOpenCalendar)}
          style={styles.inforInput}
        >
          <View style={styles.icon}>
            <MaterialIcons name="calendar-today" size={25} color="#6B7280" />
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
          />
        </View>
        <View></View>
      </View>
    </>
  );

  const selectTypeOfDebt = (type: any) => {
    setDebt({ id: "", type: type.type, totalAmount: 0, remaining: 0 });
    setIsOpenTypeDebts(false);
  };

  const renderDebtForm = () => (
    <>
      {/* Amount  */}
      <View style={styles.form}>
        <Text style={styles.amountText}>Amount</Text>
        <TextInput
          placeholder="Example 300.000"
          style={styles.amountInput}
          keyboardType="numeric"
          onChangeText={(val) => {
            const cleanNumber = val.replace(/\D/g, "");
            setAmount(cleanNumber);
          }}
          value={convertFormat(amount)}
          placeholderTextColor="#c9c9c9"
        />
      </View>

      {/* type and partner  */}
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
              debt.type !== "" ? styles.walletName : styles.placeHolderWallet
            }
          >
            {debt.type === "loan_to"
              ? "Loan to"
              : debt.type === "loan_from"
                ? "Loan from"
                : debt.type === "repay_to"
                  ? "Repay to"
                  : debt.type === "repay_from"
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
            <MaterialDesignIcons
              name="account-cash"
              size={24}
              color="#059669"
            />
          </View>
          <Text
            style={
              debt.partnerName !== ""
                ? styles.walletName
                : styles.placeHolderWallet
            }
          >
            {debt.partnerName !== "" ? debt.partnerName : "Partner"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Infor  */}
      <View style={styles.form}>
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
              walletSelected.name !== ""
                ? styles.walletName
                : styles.placeHolderWallet
            }
          >
            {walletSelected.name !== ""
              ? walletSelected.name
              : "Select a wallet"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsOpenCalendar(!isOpenCalendar)}
          style={styles.inforInput}
        >
          <View style={styles.icon}>
            <MaterialIcons name="calendar-today" size={25} color="#6B7280" />
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
          />
        </View>
      </View>
    </>
  );

  const renderSavingg = () => (
    <>
      {/* Amount  */}
      <View style={styles.form}>
        <Text style={styles.amountText}>Amount</Text>
        <TextInput
          placeholder="Example 300.000"
          style={styles.amountInput}
          keyboardType="numeric"
          onChangeText={(val) => {
            const cleanNumber = val.replace(/\D/g, "");
            setAmount(cleanNumber);
          }}
          value={convertFormat(amount)}
          placeholderTextColor="#c9c9c9"
        />
      </View>

      {/* saving  */}
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
            style={
              saving.name !== "" ? styles.walletName : styles.placeHolderWallet
            }
          >
            {saving.name !== "" ? saving.name : "Select a saving"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Infor  */}
      <View style={styles.form}>
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
              walletSelected.name !== ""
                ? styles.walletName
                : styles.placeHolderWallet
            }
          >
            {walletSelected.name !== ""
              ? walletSelected.name
              : "Select a wallet"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsOpenCalendar(!isOpenCalendar)}
          style={styles.inforInput}
        >
          <View style={styles.icon}>
            <MaterialIcons name="calendar-today" size={25} color="#6B7280" />
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
          />
        </View>
      </View>
    </>
  );

  const renderConvert = () => (
    <>
      {/* Amount  */}
      <View style={styles.form}>
        <Text style={styles.amountText}>Amount</Text>
        <TextInput
          placeholder="Example 300.000"
          style={styles.amountInput}
          keyboardType="numeric"
          onChangeText={(val) => {
            const cleanNumber = val.replace(/\D/g, "");
            setAmount(cleanNumber);
          }}
          value={convertFormat(amount)}
          placeholderTextColor="#c9c9c9"
        />
      </View>

      {/* from - to  */}
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
              walletSelected.name !== ""
                ? styles.walletName
                : styles.placeHolderWallet
            }
          >
            {walletSelected.name !== "" ? walletSelected.name : "From"}
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
          <Text
            style={
              walletSelected.name !== ""
                ? styles.walletName
                : styles.placeHolderWallet
            }
          >
            {walletTo.name || "To Wallet"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Infor  */}
      <View style={styles.form}>
        <TouchableOpacity
          onPress={() => setIsOpenCalendar(!isOpenCalendar)}
          style={styles.inforInput}
        >
          <View style={styles.icon}>
            <MaterialIcons name="calendar-today" size={25} color="#6B7280" />
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
          />
        </View>
      </View>
    </>
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
                typeAction === "Sending" ? styles.typeItemAction : null,
              ]}
              onPress={() => setTypeAction("Sending")}
            >
              <MaterialDesignIcons
                name="cash-minus"
                size={24}
                style={
                  typeAction === "Sending"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {typeAction === "Sending" && (
                <Text style={styles.typeTex}>Sending</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                typeAction === "Income" ? styles.typeItemAction : null,
              ]}
              onPress={() => setTypeAction("Income")}
            >
              <MaterialDesignIcons
                name="cash-plus"
                size={20}
                style={
                  typeAction === "Income"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {typeAction === "Income" && (
                <Text style={styles.typeTex}>Income</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                typeAction === "Debt" ? styles.typeItemAction : null,
              ]}
              onPress={() => setTypeAction("Debt")}
            >
              <MaterialDesignIcons
                name="account-cash"
                size={20}
                style={
                  typeAction === "Debt"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {typeAction === "Debt" && (
                <Text style={styles.typeTex}>Debt</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeItem,
                typeAction === "Saving" ? styles.typeItemAction : null,
              ]}
              onPress={() => setTypeAction("Saving")}
            >
              <MaterialIcons
                name="savings"
                size={20}
                style={
                  typeAction === "Saving"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {typeAction === "Saving" && (
                <Text style={styles.typeTex}>Saving</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeItem,
                typeAction === "Convert" ? styles.typeItemAction : null,
              ]}
              onPress={() => setTypeAction("Convert")}
            >
              <MaterialIcons
                name="autorenew"
                size={20}
                style={
                  typeAction === "Convert"
                    ? styles.typeItemIconAction
                    : styles.typeItemIcon
                }
              />
              {typeAction === "Convert" && (
                <Text style={styles.typeTex}>Convert</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {(typeAction === "Sending" || typeAction === "Income") &&
            renderSenInForm()}

          {typeAction === "Debt" && renderDebtForm()}

          {typeAction === "Saving" && renderSavingg()}

          {typeAction === "Convert" && renderConvert()}

          {/* Save btn  */}
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>

        {isOpenWallets && (
          <ModalWallet
            onPressClose={() => {
              setIsOpenWallets((pre) => !pre);
            }}
            data={mockWallets}
            walletSelected={
              modalTarget === "primary" ? walletSelected.id : walletTo.id
            }
            onSelected={(id: string, name: string, balance: number) => {
              const data = { id, name, balance };

              if (modalTarget === "primary") {
                setWalletSelected(data);
              } else {
                // Kiểm tra tránh chọn trùng ví nguồn
                if (id === walletSelected.id) {
                  alert(
                    "The receiving wallet address must not be the same as the sending wallet address!",
                  );
                  return;
                }
                setWalletTo(data);
              }
            }}
          />
        )}
        {isOpenCalendar && (
          <Calendar
            onPress={(year: number, m: number, d: number) =>
              handleDateSelect(year, m, d)
            }
            onPressClose={() => setIsOpenCalendar((pre) => !pre)}
            specificTime={specificTime}
          />
        )}
        {isOpenTypeDebts && (
          <TypeDebt
            isSelected={debt.type}
            onSelecte={(type: string) => selectTypeOfDebt(type)}
          />
        )}
        {isOpenListDebts && (
          <ModalDebts
            data={mockDebts}
            onPressClose={() => setIsOpenListDebts(!isOpenListDebts)}
            onSelect={({ partnerName: partnerName }: IDebtMaster) =>
              setDebt({
                id: "",
                type: debt.type,
                partnerName: partnerName,
                totalAmount: 0,
                remaining: 0,
              })
            }
            debt={debt}
            onChangeText={({ partnerName: val }: IDebtMaster) =>
              setDebt({
                id: "",
                type: debt.type,
                partnerName: val,
                totalAmount: 0,
                remaining: 0,
              })
            }
          />
        )}
        {isOpenSaving && (
          <ModalSaving
            data={mockSaving}
            saving={saving}
            onPressClose={() => setIsOpenSaving(!isOpenSaving)}
            onSelect={({ name: name }: ISaving) =>
              setSaving({ id: "", name: name, target: 0, balance: 0 })
            }
          />
        )}
        {isOpenCatNameInput && (
          <ModalCategoryName
            cat={selectedCategory}
            onPressClose={() => setIsOpenCatNameInput(false)}
            setDetailCat={setDetailCat}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
