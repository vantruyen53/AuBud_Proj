import {Text,View,TouchableOpacity,TextInput,ScrollView,Modal,KeyboardAvoidingView,Platform, StyleSheet, Alert, Animated} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import {CategoryDTO } from "@/src/models/interface/DTO";
import { Colors } from "@/src/constants/theme";
import { HomeStackNavProp } from "@/src/models/types/RootStackParamList";
import { listCatCharAlphaB } from "@/src/utils/generateSectionList ";
import { SwipeListView } from "react-native-swipe-list-view";
import { ModalCategory } from "@/src/components/customModal";
import { useProvider } from "@/src/hooks/useProvider";
import { ICategory } from "@/src/models/interface/Entities";
import { CategoryApp } from "@/src/store/application/CategoryApp";

export default function AllCategory({route}:any) {
    const navigation = useNavigation<HomeStackNavProp>();
    const {id, accessToken}=useProvider()
    const {typePar, setIsOpenCatNameInput, setSelectedCategory } = route.params
    const typeParam=()=>{
        if (typePar==="Sending")
            return 'sending'
        else if(typePar==="Income")
            return 'income'
        else return 'sending'
    };
    const type = typeParam();

    const [isSearch, setIsSearch] = useState(false)
    const [isShowModal, setIsShowModal]=useState(false)
    const [selectedCat, setSelectedCat] = useState<CategoryDTO>({id:'', name:'',type:'', iconName:'', iconColor:'', });
    const [isEditing, setIsEditing] = useState(false)

    const [content, setContent] = useState("")
    const [typeTab, setTypeTab]=useState<'sending'|'income'>(type)

    const [listSending, setListSending] = useState<ICategory[]>([]);
    const [listIncome, setListIncome] = useState<ICategory[]>([]);

    const[trigger, setTrigger]=useState(0)
    const categoryApp = new CategoryApp({id, accessToken})


    // Dữ liệu form cho modal thêm/sửa danh mục
    const [categoryForm, setCategoryForm] = useState<CategoryDTO>({
        id: '',
        name: '',
        type: typeTab,
        iconName: 'restaurant',
        iconColor: '255, 107, 107',
    });

    useEffect(()=>{
        const fetch = async()=>{
            const result = await categoryApp.getAllCategory()
            if(result){
                setListSending(result.catSending);
                setListIncome(result.catIncome);
            }
        }
        fetch();
    },[trigger])

    const clearForm = ()=>{
        setIsEditing(false)
        setContent('')
        setCategoryForm({
            id: '',
            name: '',
            type: typeTab,
            iconName: 'restaurant',
            iconColor: '255, 107, 107'
        })
    }

    const handleDelete = (id: string) => {
        Alert.alert(
          "Delete",
          "Are your sure to delelte this category?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Xóa",
              style: "destructive",
              onPress:async () => {
                const result = await categoryApp.deleteCategory(id)
                if(result)
                    setTrigger((pre)=>pre+1)
              },
            },
          ],
        );
      };
    const handleEdit = (item:CategoryDTO) => {
        setCategoryForm(item);
        setIsEditing(true);
        setIsShowModal(true);
        setTrigger((pre)=>pre+1)
      };
    const handleSave = async () => {
        if (!categoryForm.name.trim()) {
            Alert.alert("Error", "Please enter category name");
            return;
        }
        if (isEditing) {
            // Update existing
            const result = await categoryApp.updateCategory(categoryForm)
            if(result)
                setTrigger((pre)=>pre+1)
        } else {
            const result = await categoryApp.addCategory(categoryForm)
               if(result)
                setTrigger((pre)=>pre+1)
        }
        clearForm();
        setIsShowModal(false);
    };

    const sections = useMemo(()=>{
        switch (typeTab){
            case 'sending':
                return listCatCharAlphaB(listSending)
            case 'income':
                return listCatCharAlphaB(listIncome)
            default:
                return null
        } 
    }, [typeTab,listSending,listIncome])

    const renderSectionHeader = (infor:{section:any})=>(
        <View style={{ paddingTop: 10, paddingBottom: 10, marginStart:10 }}>
            <Text style={{ fontWeight: "600", fontSize: 14 }}>{infor.section.key}</Text>
        </View>)
    const renderItem = (data:any, rowMap:any)=>{
        const item = data.item as CategoryDTO;
        return(
            <TouchableOpacity
                key={item.id}
                style={styles.catItem}
                onPress={() => {
                  setSelectedCat({id:item.id, name:item.name, type:item.type, iconName:item.iconName, iconColor:item.iconColor}),
                  setSelectedCategory&&setSelectedCategory({id:item.id, name:item.name, type:item.type, iconName:item.iconName, iconColor:item.iconColor}),
                  setIsOpenCatNameInput&&setIsOpenCatNameInput(true)
                  setSelectedCategory&&navigation.goBack();
                }}
            >
                <View
                  style={[
                    styles.catIconBg,
                    { backgroundColor: `rgba(${item.iconColor},0.1)` },
                    selectedCat.id === item.id && styles.catIconBgSelected,
                  ]}
                >
                  <MaterialIcons
                    name={item.iconName as any}
                    size={28}
                    color={`rgb(${item.iconColor})`}
                  />
                </View>
                <Text
                  style={[
                    styles.catName,
                    selectedCat.id === item.id && styles.catNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
            </TouchableOpacity>
        )
    }
    const renderHiddenItem = (data: any) => {
        const item = data.item;
        return (
            <View style={styles.hiddenContainer}>
                {/* Nút Edit nằm bên trái trong cụm nút ẩn */}
                <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={[styles.hiddenBtn, { backgroundColor: '#12D0FF' }]}
                >
                    <MaterialIcons name="edit" size={20} color="#FFF" />
                </TouchableOpacity>

                {/* Nút Delete nằm bên phải ngoài cùng */}
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
                        <Text style={styles.headerTitle}>History transaction</Text>         
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
                    keyExtractor={(item: CategoryDTO) => item.id}
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
                onPress={() => setIsShowModal(true)}
            >
                <MaterialIcons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Category Modal */}
            <ModalCategory
                isModalVisible={isShowModal}
                setIsModalVisible={setIsShowModal}
                isEditing={isEditing}
                handleSave={handleSave}
                categoryForm={categoryForm}
                setCategoryForm={setCategoryForm}
                typeTab={typeTab}
            />
        </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container:{
            flex: 1,
            backgroundColor: Colors.light.inputBg,
            padding: 16,
            paddingBottom:0,
            position:'relative'
    }, 
        // Header
        header: {
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        backButton: {
            width: 30,
            height: 30,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitle: {
            textAlign:"center",
            fontSize: 18,
            fontWeight: "600",
            color: Colors.light.textMain,
        },
        searchButton: {
            width: 40,
        },
        formSearch:{
            flex:1,
            backgroundColor:"#f9fdfe",
            borderWidth:1,
            borderStyle:"solid",
            borderColor: Colors.light.border,
            flexDirection: "row",
            alignItems: "center",
            padding:5,
            borderRadius:10
        },
        contentSearch:{
            flex:1,
        },
        clearFrom:{
            width:20,
            height:20,
            borderRadius: 20,
            backgroundColor: "#e0f5ffe0",
            justifyContent: "center",
            alignItems: "center",
        },
        filterSearch:{
            marginStart:5
        },

        // header tab 
        headerTabs:{
            flexDirection:'row',
            borderBottomWidth:1,
            borderBottomColor:'#e1e1e1',
        },
        typeTab:{
            flex:1,
            justifyContent:'center',
            paddingVertical:15,
            alignItems:'center',
        },
        typeTabAction:{
            borderBottomWidth:2,
            borderBottomColor:Colors.light.primary,
        },
        tabText:{
           fontWeight:'600',
           fontSize:16 
        },
        tabTextAction:{
            color:Colors.light.primary
        },

    // renderHiddenItem
    hiddenContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: Colors.light.inputBg, // Màu nền phía sau khi vuốt
        paddingRight: 10,
    },
    hiddenBtn: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Khoảng cách giữa 2 nút
        // Shadow nhẹ cho nút trông nổi hơn
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    //   Delete category item 
    deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 12,
  },
  deleteActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

    //fab
    fab:{
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 100,
    },

    // category item 
    catItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.inputBg,
        gap: 12,
        // Thêm border bottom nhẹ để phân cách nếu muốn
        borderBottomWidth: 0.5,
        borderBottomColor: '#F1F5F9',
    },
    catIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catIconBgSelected: {
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    catName: {
        fontSize: 15, // Tăng nhẹ cho dễ đọc
        color: Colors.light.textMain,
        fontWeight: '500',
    },
    catNameSelected: {
        fontWeight: '700',
        color: Colors.light.primary,
    },
})
