import { Modal, KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "../assets/styles/modalStyle";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { ScrollView } from "react-native-gesture-handler";
import {toInitialFormatCurrency} from '../utils/format';
import { IWallet, IDebtMaster, ISaving, ICategory } from "../models/IApp";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { HomeStackNavProp } from "../models/types/RootStackParamList";

export  function ModalForm(props:any) {
  let amount = ""
  if(props.formData.amount != undefined || props.formData.amount != null)
    amount = toInitialFormatCurrency(props.formData.amount)
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
                              <Text style={styles.inputLabel}>Transaction Name</Text>
                              <TextInput
                              style={styles.input}
                              placeholder="Example: Supermarket, Coffee..."
                              value={props.formData.title}
                              
                              onChangeText={(val) => props.setFormData({...props.formData, title: val})}
                              />

                              <Text style={styles.inputLabel}>Note</Text>
                              <TextInput
                              style={styles.input}
                              placeholder="Example: Buy dinner, Gasoline..."
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
                                  placeholder="Example: Cash, Bank account..."
                                  value={props.formData.value}
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
                          value={props.formData.value}
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
                      value={props.formData.value}
                      onChangeText={(val) => props.setFormData({...props.formData, target: val})}
                    />
                  </>
                )}
                {props.type === 'debt' && (
                  <>
                    <Text style={styles.inputLabel}>Type</Text>
                    <View style={styles.typeRow}>
                      <TouchableOpacity 
                        style={[styles.typeBtn, props.formData.type === 'borrow' && styles.typeBtnActive]} 
                        onPress={() => props.setFormData({...props.formData, type: 'borrow'})}
                      >
                        <Text style={[styles.typeBtnText, props.formData.type === 'borrow' && styles.typeBtnTextActive]}>Borrow</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.typeBtn, props.formData.type === 'lend' && styles.typeBtnActive]} 
                        onPress={() => props.setFormData({...props.formData, type: 'lend'})}
                      >
                        <Text style={[styles.typeBtnText, props.formData.type === 'lend' && styles.typeBtnTextActive]}>Lend</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>Partner Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Borrower/Lender Name"
                      value={props.formData.to_other}
                      onChangeText={(val) => props.setFormData({...props.formData, to_other: val})}
                    />

                    <Text style={styles.inputLabel}>Total amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={props.formData.amount?.toString()}
                      onChangeText={(val) => props.setFormData({...props.formData, amount: val})}
                    />

                    <Text style={styles.inputLabel}>Remain Amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={props.formData.remaining?.toString()}
                      onChangeText={(val) => props.setFormData({...props.formData, remaining: val})}
                    />
                  </>
                )}
              </ScrollView>
              <View style={styles.modalFooter}>
                  {props.typeAction==='edit' &&
                    <TouchableOpacity 
                      style={styles.deleteBtnModal} 
                      onPress={()=>props.onPressDelete(props.type, )}
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
            <MaterialIcons style={props.timeLine === "Date" ? styles.selecteTimeIconActive:styles.selecteTimeIcon}  name="calendar-today" size={20}/>
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
  const [val, setVal] = useState<string>('')
  let debtsData:IDebtMaster[]=props.data;
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

          <View style={{flexDirection:'row', gap:10}}>
            <TextInput 
              placeholder="Select a debt/loan or add new" 
              style={styles.addNewInput}
              onChangeText={(val)=>setVal(val)}
            />
            <TouchableOpacity 
              style={styles.addNewBtn}
              onPress={()=>{props.onChangeText({partnerName:val}),props.onPressClose();}}
            >
              <Text style={styles.addNewText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Data  */}
          {debtsData.map((item) => {
            const isLoanFrom = item.type === "loan_from";
            const mainColor = isLoanFrom ? '#059669' : '#d90000';
            const bgColor = isLoanFrom ? '#05966915' : '#d9000015';
            const isActive = props.debt.partnerName === item.partnerName;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  props.onSelect({ partnerName: item.partnerName });
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
                    <Text style={styles.timeLoan}>{item.createAt}</Text>
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
  let saingList:ISaving[]=props.data;
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
          {saingList.map((item)=>{
            const isActive = props.saving.id === item.id;
            const mainColor ="#12D0FF";
            const remainBalance = (target:number, balance: number)=>{
              const re = target-balance
              return re.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
              return(
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    props.onSelect({ name: item.name });
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


export function ModalCreateFund({ isVisible, onClose, onSave }: any) {
  const [fundName, setFundName] = useState('');

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo Quỹ Mới</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalForm}>
            <Text style={styles.inputLabel}>Tên Quỹ</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Quỹ mua xe..."
              value={fundName}
              onChangeText={setFundName}
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: '#F1F5F9' }]} 
              onPress={onClose}
            >
              <Text style={[styles.saveBtnText, { color: '#1E293B' }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => {
                onSave(fundName);
                onClose();
                setFundName('');
              }}
            >
              <Text style={styles.saveBtnText}>Tạo Quỹ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
