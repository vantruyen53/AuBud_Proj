import { Modal, KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "../assets/styles/modalStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { ScrollView } from "react-native-gesture-handler";
import {toInitialFormatCurrency} from '../utils/format';
import { IDebt } from "../models/interface/Entities";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { HomeStackNavProp } from "../models/types/RootStackParamList";
import { Colors } from "../constants/theme";
import { AVAILABLE_ICONS_SENDING, AVAILABLE_ICONS_INCOME, AVAILABLE_COLORS } from "@/src/store/seed/iconList";

import { IWallet, ISaving, ICategory } from "../models/IApp";

export  function ModalForm(props:any) {
  let amount = ""

  if(props.typeAction==="edit")
    if(props.formData.amount !== undefined)
      amount = toInitialFormatCurrency(props.formData?.amount)

  return (
    <Modal
        visible={props.isVisible}
        animationType="fade"
        transparent={true}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                        {
                            props.type === "transaction" ? "Edit Transaction":
                            props.type === "wallet" || "saving" || "debt"?
                            <>
                                {props.typeAction === "edit" ? 'Edit ' : 'Add '}{
                                    props.type === 'wallet' ? 'Wallet' : 
                                    props.type === 'saving' ? 'Saving' :
                                    props.type === 'debt' ? 'Debt/Loan' :
                                    props.type === 'group' ? 'Group' : ""
                                }
                            </>
                            : ""
                        }
                    </Text>
                    <TouchableOpacity onPress={props.onPressClose}>
                        <MaterialIcons name="close" size={24} color="#1E293B" />
                    </TouchableOpacity>
            </View>
            {props.type==="group" && props.typeAction==='edit'? 
            <Text>Please join a group to edit or add new group fund</Text> :
            <>
              <ScrollView
                  style={styles.modalForm}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {
                      (props.type === "transaction") && (
                          <>
                              <Text style={styles.inputLabel}>Transaction name</Text>
                              <TextInput
                              style={styles.input}
                              placeholder="Ví dụ: Tiền siêu thị..."
                              value={props.formData.title}
                              
                              onChangeText={(val) => props.setFormData({...props.formData, title: val})}
                              />

                              <Text style={styles.inputLabel}>Note</Text>
                              <TextInput
                              style={styles.input}
                              placeholder="Ví dụ: Mua đồ ăn tối..."
                              value={props.formData.note}
                              onChangeText={(val) => props.setFormData({...props.formData, note: val})}
                              />

                              <Text style={styles.inputLabel}>Amount</Text>
                              <TextInput
                              style={styles.input}
                              placeholder="0"
                              keyboardType="numeric"
                              value={amount}
                              onChangeText={(val) => props.setFormData({...props.formData, amount: val})}
                              />
                          </>
                      )
                  }
                  {
                      (props.type === "wallet" || props.type === "saving" || props.type === "debt") && (
                          <>
                              <Text style={styles.inputLabel}>Name</Text>
                              <TextInput
                                  style={styles.input}
                                  placeholder="Ví dụ: Tiền mặt, Vietcombank..."
                                  value={props.formData?.name}
                                  onChangeText={(val) => props.setFormData({...props.formData, name: val})}
                              />
                          </>
                      )
                  }
                  {(props.type === 'wallet' || props.type === 'saving') && (
                      <>
                      <Text style={styles.inputLabel}>Balance</Text>
                      <TextInput
                          style={styles.input}
                          placeholder="0"
                          keyboardType="numeric"
                          value={props.formData?.balance?.toString()}
                          onChangeText={(val) => props.setFormData({...props.formData, balance: val})}
                      />
                      </>
                  )}
                  {props.type === 'saving' && (
                  <>
                    <Text style={styles.inputLabel}>Target</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={props.formData?.target?.toString()}
                      onChangeText={(val) => props.setFormData({...props.formData, target: val})}
                    />
                  </>
                )}
                {props.type === 'debt' && (
                  <>
                    <Text style={styles.inputLabel}>Type</Text>
                    <View style={styles.typeRow}>
                      <TouchableOpacity 
                        style={[styles.typeBtn, props.formData?.type === 'loan_from' && styles.typeBtnActive]} 
                        onPress={() => props.setFormData({...props.formData, type: 'loan_from'})}
                      >
                        <Text style={[styles.typeBtnText, props.formData?.type === 'loan_from' && styles.typeBtnTextActive]}>Đi vay</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.typeBtn, props.formData?.type === 'loan_to' && styles.typeBtnActive]} 
                        onPress={() => props.setFormData({...props.formData, type: 'loan_to'})}
                      >
                        <Text style={[styles.typeBtnText, props.formData?.type === 'loan_to' && styles.typeBtnTextActive]}>Cho vay</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>To other</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tên người vay/cho vay"
                      value={props.formData?.partnerName}
                      onChangeText={(val) => props.setFormData({...props.formData, partnerName: val})}
                    />

                    <Text style={styles.inputLabel}>Total amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={props.formData?.totalAmount?.toString()}
                      onChangeText={(val) => props.setFormData({...props.formData, totalAmount: val})}
                    />

                    <Text style={styles.inputLabel}>Remain amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={props.formData?.remaining?.toString()}
                      onChangeText={(val) => props.setFormData({...props.formData, remaining: val})}
                    />
                  </>
                )}
              </ScrollView>
              <View style={styles.modalFooter}>
                  {props.typeAction==='edit' &&
                    <TouchableOpacity 
                      style={styles.deleteBtnModal} 
                      onPress={()=>props.onPressDelete(props?.type, props.formData)}
                    >
                      <MaterialIcons name="delete-forever" size={20} color="#EF4444" />
                      <Text style={styles.deleteBtnModalText}>Delete</Text>
                    </TouchableOpacity>
                  }
                  <TouchableOpacity style={styles.saveBtn} onPress={props.onPressSave}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
              </View>
            </>}
          </View>
        </KeyboardAvoidingView>
    </Modal>
  )
}

export function ModalTime(props: any){
  return(
    <Modal
      visible={props.isVisible}
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Timeline</Text>
            <TouchableOpacity onPress={props.onPressClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.ListSelectItem}>
          <TouchableOpacity 
            onPress={()=>{props.setTimeLine("Date"); props.onPressClose()}} 
            style={props.timeLine === "Date" ? styles.selecteTimeActive : styles.selecteTimeBTn}
          >
            <MaterialDesignIcons style={props.timeLine === "Date" ? styles.selecteTimeIconActive:styles.selecteTimeIcon}  name="calendar-today" size={20}/>
            <Text style={props.timeLine === "Date" ? styles.selecteTimeTextActive : styles.selecteTimeText}>Date</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={()=>{props.setTimeLine("Month"); props.onPressClose()}} 
            style={props.timeLine === "Month" ? styles.selecteTimeActive : styles.selecteTimeBTn}
          >
            <MaterialIcons style={props.timeLine === "Month" ? styles.selecteTimeIconActive:styles.selecteTimeIcon} name="calendar-month" size={20}/>
            <Text style={props.timeLine === "Month" ? styles.selecteTimeTextActive : styles.selecteTimeText}>Month</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={()=>{props.setTimeLine("Year"); props.onPressClose()}} 
            style={props.timeLine === "Year" ? styles.selecteTimeActive : styles.selecteTimeBTn}
          >
            <MaterialIcons style={props.timeLine === "Year" ? styles.selecteTimeIconActive:styles.selecteTimeIcon}  name="calendar-today" size={20}/>
            <Text style={props.timeLine === "Year" ? styles.selecteTimeTextActive : styles.selecteTimeText}>Year</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function ModalWallet(props:any){
  const walletsData:IWallet[] = props.data;
  return(
    <Modal
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header  */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Wallet</Text>
            <TouchableOpacity onPress={props.onPressClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* Wallets  */}
          {
            walletsData.map((item)=>(
             <TouchableOpacity 
              key={item.id}  
              style={props.walletSelected===item.id ? styles.walletItemAction : styles.walletItem}
              onPress={()=>{props.onSelected(item.id, item.name, item.balance), props.onPressClose()}}
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
                    <Text style={styles.balance}>{`${item.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`}</Text>
                </View>
            </TouchableOpacity>
            ))
          }

        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
} 

export function ModalDebts(props:any){
  let debtsData:IDebt[]=props.data;
  return(
    <Modal
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header  */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Debt</Text>
            <TouchableOpacity onPress={props.onPressClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* Data  */}
          {debtsData.map((item) => {
            const isLoanFrom = item.type === "loan_from";
            const mainColor = isLoanFrom ? '#059669' : '#d90000';
            const bgColor = isLoanFrom ? '#05966915' : '#d9000015';
            const isActive = props.debt === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  props.onSelect(item.id, item.partnerName, item.remaining);
                  props.onPressClose();
                }}
                style={[styles.debtItem, isActive && styles.debtItemAction]}
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
                    <Text style={styles.timeLoan}>{item.createdAt}</Text>
                  </View>
                </View>

                {/* Cụm bên phải: Số tiền */}
                <View style={styles.rightInforWrapper}>
                  <View style={styles.amountRow}>
                    <Text style={styles.textAmountLabel}>Remain</Text>
                    <Text style={[styles.loanAmount, { color: mainColor }]}>
                      {`${item.remaining?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`}
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
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function ModalSaving(props:any){
  let savingList:ISaving[]=props.data;
  return(
    <Modal
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header  */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Debt</Text>
            <TouchableOpacity onPress={props.onPressClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* render data  */}
          {savingList.map((item)=>{
            const isActive = props.selected === item.id;
            const mainColor ="#12D0FF";
            const remainBalance = (target:number, balance: number)=>{
              const re = target-balance
              return re.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
              return(
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    props.onSelect(item.id, item.name, item.balance);
                    props.onPressClose();
                  }}
                  style={[styles.debtItem, isActive && styles.debtItemAction]}
                >

                  {/* Cụm bên trái: Icon + Thông tin tên */}
                  <View style={styles.leftInfor}>
                    <View style={[styles.iconContainer, { backgroundColor: `${mainColor}15` }]}>
                      <MaterialIcons
                        name='savings'
                        size={22}
                        color={mainColor}
                      />
                    </View>
                    <View style={styles.nameContainer}>
                      <Text style={styles.partnerNameText}>{item.name}</Text>
                      <Text style={styles.timeLoan}>Target: {`${item.target?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`}</Text>
                    </View>
                  </View>

                  {/* Cụm bên phải: Số tiền */}
                  <View style={styles.rightInforWrapper}>
                    <View style={styles.amountRow}>
                      <Text style={[styles.loanAmount, { color: mainColor }]}>
                        {`${item.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`}
                      </Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.textAmountLabel}>Remain</Text>
                      <Text style={styles.totalAmountSmall}>
                      {`${remainBalance(item.target ?? 0, item.balance ?? 0)} ₫`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function ModalCategoryName(props:any){
  const [tranName, setTranName]= useState('')
  const cat = props.cat;

  return(
    <Modal
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header  */}
          <View style={[styles.modalHeader,{borderBottomWidth:1, borderBottomColor:'#eaeaea', paddingBottom:10}]}>
            <View style={styles.headerCat}>
              <View style={{borderRadius:8,padding:5, backgroundColor:`rgba(${cat.iconColor},0.1)`}}>
                <MaterialIcons
                  name={cat.iconName}
                  color={`rgb(${cat.iconColor})`}
                  size={24}
                />
              </View>
              <Text style={styles.headerCatText}>{cat.name}</Text>
            </View>
            <TouchableOpacity onPress={props.onPressClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Detail transaction name</Text>
          <View style={{flexDirection:'row', gap:10}}>
            <TextInput
              style={styles.addNewInput}
              placeholder="Example: Breakfast, Milk, Game,..."
              onChangeText={(val) => setTranName(val)}
            />
            <TouchableOpacity 
              style={styles.addNewBtn}
              onPress={()=>{props.setDetailCat(tranName),props.onPressClose();}}
            >
              <Text style={styles.addNewText}>Add</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function ModalBudget({visible,onPressClose, onPressSave, nav,selectedCategory,target,onChangeText}:any){
  const navigation = useNavigation<HomeStackNavProp>();
  console.log('======target at ModalBudget: ', target)

  const [tartget, setTarget] = useState(0)

  return(
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header  */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Debt</Text>
            <TouchableOpacity onPress={onPressClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Target</Text>
          <TextInput
              style={styles.input}
              placeholder="Example: Breakfast, Milk, Game,..."
              keyboardType="numeric"
              value={target === 0 ? '' : target.toString()}
              onChangeText={(val) => {
                  // Xử lý chuỗi rỗng để không bị lỗi parseInt(NaN)
                  const numericValue = val.replace(/[^0-9]/g, '');
                  onChangeText(numericValue === '' ? 0 : parseInt(numericValue));
              }}
          />

          <Text style={styles.inputLabel}>Select category</Text>
          <TouchableOpacity
              style={styles.catItem}
              onPress={()=>nav()}
            >
              <View
                style={[styles.catIconBg, 
                  selectedCategory.id!==""? 
                    { backgroundColor: `rgba(${selectedCategory.iconColor},0.1)` }:
                    { backgroundColor: `#12D0FF10` }
                ]}
              >
                <MaterialIcons
                  color={selectedCategory.id!==""?`rgb(${selectedCategory.iconColor})`:"#12D0FF"}
                  size={28}
                  name={selectedCategory.id!==""?selectedCategory.iconName:"add-circle"}
                />
              </View>
              <Text style={[styles.catName,selectedCategory.id!==""?{color:'#000'}:{color:'#d2d2d2'}]}
              >{selectedCategory.id!==""?selectedCategory.name:'Category name'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.saveBtn, {flex:0, width:'100%', height:50, marginTop:15}]} onPress={onPressSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function ModalCategory({isModalVisible, setIsModalVisible, isEditing,
  handleSave,categoryForm,setCategoryForm, typeTab}:any){
    const currentIcons = typeTab === 'sending'?AVAILABLE_ICONS_SENDING : AVAILABLE_ICONS_INCOME;
  return(
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <MaterialIcons name="close" size={24} color={Colors.light.textMain} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Category' : 'New Category'}</Text>
            <TouchableOpacity onPress={()=>handleSave()}>
              <MaterialIcons name="check" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
    
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon Preview & Name Input */}
            <View style={styles.inputSection}>
              <View style={[styles.previewIconBg, { backgroundColor: `rgba(${categoryForm.iconColor}, 0.1)` }]}>
                <MaterialIcons name={categoryForm.iconName} size={40} color={`rgb(${categoryForm.iconColor})`} />
              </View>
              <View style={styles.nameInputContainer}>
                <Text style={styles.inputLabel}>Enter category name</Text>
                <TextInput
                  style={styles.nameInput}
                  value={categoryForm.name}
                  onChangeText={(text) => setCategoryForm({ ...categoryForm, name: text })}
                  placeholder="Gifts"
                  placeholderTextColor={Colors.light.placeholder}
                />
              </View>
            </View>
    
            {/* Color Selection */}
              <Text style={styles.sectionTitle}>Select Color</Text>
              <View style={styles.colorGrid}>
                {AVAILABLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setCategoryForm({ ...categoryForm, iconColor: color })}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: `rgb(${color})` },
                      categoryForm.iconColor === color && styles.colorCircleSelected
                    ]}
                  />
                ))}
              </View>
    
              {/* Icon Selection */}
              <Text style={styles.sectionTitle}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {currentIcons.map((icon: string) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setCategoryForm({ ...categoryForm, iconName: icon })}
                    style={[
                      styles.iconBox,
                      categoryForm.iconName === icon && { borderColor: Colors.light.primary, borderWidth: 2 }
                    ]}
                   >
                    <MaterialIcons name={icon as any} size={28} color={categoryForm.iconName === icon ? `rgb(${categoryForm.iconColor})` : Colors.light.textSub} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
    </Modal>
  )
}

