import {Text,View,TouchableOpacity,TextInput,ScrollView,Modal,KeyboardAvoidingView,Platform, Alert, Animated} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import {mockCategoriesIncome,mockCategoriesSending, AVAILABLE_ICONS_SENDING, AVAILABLE_ICONS_INCOME, AVAILABLE_COLORS } from "../../../store/seed/category";
import {ICategory } from "../../../models/IApp";
import { Colors } from "../../../constants/theme";
import { HomeStackNavProp } from "../../../models/types/RootStackParamList";
import { listCatCharAlphaB } from "../../../utils/generateSectionList";
import { SwipeListView } from "react-native-swipe-list-view";
import styles from "../../../assets/styles/allCategoryStyle";

export default function AllCategory({route}:any) {
    const navigation = useNavigation<HomeStackNavProp>();
    const {typePar, setIsOpenCatNameInput, setSelectedCategory } = route.params
    // Xác định loại danh mục ban đầu dựa trên tham số truyền vào
    const typeParam=()=>{
        if (typePar==="Sending")
            return 'sending'
        else if(typePar==="Income")
            return 'income'
        else return 'sending'
    };
    const type = typeParam();

    // Các trạng thái quản lý tìm kiếm, modal và chỉnh sửa
    const [isSearch, setIsSearch] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    
    // Nội dung tìm kiếm
    const [content, setContent] = useState("")
    
    // Tab đang chọn (chi tiêu/thu nhập)
    const [typeTab, setTypeTab]=useState<'sending'|'income'>(type)

    // Danh sách danh mục chi tiêu và thu nhập
    const [listSending, setListSending] = useState<ICategory[]>(mockCategoriesSending);
    const [listIncome, setListIncome] = useState<ICategory[]>(mockCategoriesIncome);

    // Dữ liệu form cho modal thêm/sửa danh mục
    const [categoryForm, setCategoryForm] = useState<ICategory>({
        id: '',
        name: '',
        type: typeTab,
        iconName: 'restaurant',
        iconColor: '255, 107, 107'
    });

    useEffect(() => {
        setCategoryForm(prev => ({ ...prev, type: typeTab }));
    }, [typeTab]);

    const currentIcons = typeTab === 'sending' ? AVAILABLE_ICONS_SENDING : AVAILABLE_ICONS_INCOME;

    const handleDelete = (id: string) => {
        Alert.alert(
          "Confirm Delete",
          "Are you sure you want to delete this category?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                if (typeTab === 'sending') {
                    setListSending(prev => prev.filter(c => c.id !== id));
                } else {
                    setListIncome(prev => prev.filter(c => c.id !== id));
                }
              },
            },
          ],
        );
      };

    const handleEdit = (item: ICategory) => {
        setCategoryForm(item);
        setIsEditing(true);
        setIsModalVisible(true);
    };

    // Xử lý lưu thông tin danh mục
    const handleSave = () => {
        if (!categoryForm.name.trim()) {
            Alert.alert("Error", "Please enter category name");
            return;
        }

        if (isEditing) {
            // Update existing
            if (typeTab === 'sending') {
                setListSending(prev => prev.map(c => c.id === categoryForm.id ? categoryForm : c));
            } else {
                setListIncome(prev => prev.map(c => c.id === categoryForm.id ? categoryForm : c));
            }
        } else {
            // Add new
            const newCat = { ...categoryForm, id: Date.now().toString() };
            if (typeTab === 'sending') {
                setListSending(prev => [...prev, newCat]);
            } else {
                setListIncome(prev => [...prev, newCat]);
            }
        }

        setIsModalVisible(false);
    };

    // Phân chia danh mục theo chữ cái đầu để hiển thị SectionList
    const sections = useMemo(()=>{
        switch (typeTab){
            case 'sending':
                return listCatCharAlphaB(listSending)
            case 'income':
                return listCatCharAlphaB(listIncome)
            default:
                return null
        } 
    }, [typeTab, listSending, listIncome])

    const renderSectionHeader = (infor:{section:any})=>(
        <View style={{ paddingTop: 10, paddingBottom: 10, marginStart:10 }}>
            <Text style={{ fontWeight: "600", fontSize: 14 }}>{infor.section.key}</Text>
        </View>)
    const renderItem = (data:any, rowMap:any)=>{
        const item = data.item as ICategory;
        return(
            <TouchableOpacity
                key={item.id}
                style={styles.catItem}
                onPress={() => {
                  setSelectedCategory({id:item.id, name:item.name, type:item.type, iconName:item.iconName, iconColor:item.iconColor})
                  setIsOpenCatNameInput&&setIsOpenCatNameInput(true)
                  navigation.goBack();
                }}
            >
                <View
                  style={[
                    styles.catIconBg,
                    { backgroundColor: `rgba(${item.iconColor},0.1)` },
                  ]}
                >
                  <MaterialIcons
                    name={item.iconName as any}
                    size={28}
                    color={`rgb(${item.iconColor})`}
                  />
                </View>
                <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
        )
    }
    const renderHiddenItem = (data: any) => {
        const item = data.item;
        return (
            <View style={styles.hiddenContainer}>
                <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={[styles.hiddenBtn, { backgroundColor: '#12D0FF' }]}
                >
                    <MaterialIcons name="edit" size={20} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={[styles.hiddenBtn, { backgroundColor: '#EF4444' }]}
                >
                    <MaterialIcons name="delete" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        );
    };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1}}
        >
            {/* Header  */}
            <View style={styles.header}>
                {
                    isSearch ? (
                    <>
                        <TouchableOpacity style={styles.backButton} onPress={()=>setIsSearch(false)}>
                        <MaterialIcons name="arrow-back-ios" size={16}/>
                        </TouchableOpacity>
                        <View style={styles.formSearch}>
                        <TextInput 
                            value={content}
                            onChangeText={setContent}
                            style={styles.contentSearch}
                            autoFocus
                        />
                        {
                            content.length > 0 ? 
                            <TouchableOpacity onPress={()=>setContent("")} style={styles.clearFrom}>
                            <MaterialIcons name="close"/>
                            </TouchableOpacity> : ""
                        }
                        </View>
                        <TouchableOpacity style={styles.filterSearch} onPress={()=>{}}>
                        <MaterialIcons name="filter-list" size={20} color={Colors.light.iconLight}/>
                        </TouchableOpacity>
                    </>
                    ) : (
                    <>
                        <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        >
                        <MaterialIcons
                            name="arrow-back-ios"
                            size={20}
                            color={Colors.light.iconLight}
                        />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>All Category</Text>         
                        <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => setIsSearch(true)}
                        >
                        <MaterialIcons
                            name="search"
                            size={20}
                            color={Colors.light.tabIconDefault}
                        />
                        </TouchableOpacity>

                    </>
                    )
                }
            </View>

            {/* type tabs  */}
            <View style={styles.headerTabs}>
                <TouchableOpacity
                    style={[styles.typeTab, typeTab==="sending"?styles.typeTabAction: null]}
                    onPress={()=>setTypeTab('sending')}
                >
                    <Text style={[styles.tabText, typeTab==="sending"?styles.tabTextAction: null]}>Sending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeTab, typeTab==="income"?styles.typeTabAction: null]}
                    onPress={()=>setTypeTab('income')}
                >
                    <Text style={[styles.tabText, typeTab==="income"?styles.tabTextAction: null]}>Income</Text>
                </TouchableOpacity>
            </View>

            {/* category list  */}
            <SwipeListView
                    useSectionList
                    sections={sections as any}
                    keyExtractor={(item: ICategory) => item.id}
                    rightOpenValue={-130}
                    disableRightSwipe={true}
                    swipeToOpenPercent={40}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={renderSectionHeader}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
            />

            {/* fab  */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => {
                    setCategoryForm({
                        id: '',
                        name: '',
                        type: typeTab,
                        iconName: 'restaurant',
                        iconColor: AVAILABLE_COLORS[0]
                    });
                    setIsEditing(false);
                    setIsModalVisible(true)
                }}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Category Modal */}
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
                            <TouchableOpacity onPress={handleSave}>
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
        </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
