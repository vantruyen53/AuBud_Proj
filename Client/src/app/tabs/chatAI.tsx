import { Text, View, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Image, ScrollView, Platform} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "@/src/constants/theme";
import { TextInput } from "react-native-gesture-handler";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState } from "react";
import { IMessage, IUser } from "@/src/models/IApp";

export default function ChatAI() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');

  const renderMess = (mess:string, from:string, key:string)=>(
    <View key={key} style={[styles.messItem, from==="chatApp"&&{alignItems:'flex-start'}]}>
      <Text style={[styles.messText, from!=="chatApp"&&styles.messUser]}>{mess}</Text>
    </View>
  )

  const handlePostMess=async(mess:string, userId?:string)=>{
    const tempMess:IMessage = {
      _id:'mess1', //fake id, don't care logic
      text:mess,
      createdAt:(new Date()).toString(),
      from:userId!==""?"user01":"chatApp"
    }

    setMessages(pre=>[ ...pre,tempMess])
    setNewMessageText('');

    setTimeout(() => {
      const botRes: IMessage = {
        _id: Math.random().toString(),
        text: "Tôi đã ghi nhận yêu cầu của bạn!",
        createdAt: new Date().toString(),
        from: "chatApp"
      }
      setMessages(prev => [...prev,botRes]);
    }, 1000);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Header  */}
      <View style={styles.header}>
        <Image
          style={styles.chatIcon}
          source={require("../../assets/images/welcome.png")}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>AuBud AI</Text>
      </View>

      <KeyboardAvoidingView 
        style={{flex:1}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Message area */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.length===0?
          <View style={styles.intro}>
            <Text style={styles.chatName}>AuBud</Text>
            <Text style={styles.introText}>How can i help you</Text>
          </View>:
          messages.map(mess=>(
            renderMess(mess.text, mess.from, mess._id)
          ))
          }
      </ScrollView>

      {/* input area  */}
      <View style={styles.messForm}>
        <TextInput
          style={styles.input}
          onChangeText={(val)=>setNewMessageText(val)}
          multiline
          value={newMessageText}
          placeholder="Nhập yêu cầu..."
        />
        <TouchableOpacity
          disabled={newMessageText===""}
          onPress={()=>handlePostMess(newMessageText)}
        >
          <MaterialIcons
            name="send"
            size={30}
            color={newMessageText!==""?`${Colors.light.primary}`:`${Colors.light.border}`}
          />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal:16,
    backgroundColor: Colors.light.inputBg,
  },
  header:{
    paddingBottom:5,
    flexDirection:'row',
    alignItems:'center',
    gap:7,
  },
  chatIcon:{
    width:45,
    height:45,
    borderRadius:50,
  },
  headerTitle:{
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    fontFamily: Fonts.rounded,
  },

  // scroll 
  scrollView:{
    flex:1,
  },
  scrollContent:{
    paddingTop:10,
  },

  // mess item 
  intro:{
    flex:1,
    marginTop: 100,
    alignItems:'center',
    gap:15
  },
  chatName:{
    fontSize:30,
    fontWeight:'600'
  },
  introText:{
    fontSize:16,
  },
  messItem:{
    marginVertical:5,
    alignItems:'flex-end',
  },
  messText:{
    fontSize:16,
  },
  messUser:{
    maxWidth:'70%',
    padding:12,
    borderRadius:16,
    borderBottomRightRadius:0,
    backgroundColor:'#fff',
    fontSize:16,
  },

  // input 
  messForm:{
    flexDirection:'row',
    gap:10,
    alignItems:'center',
    paddingVertical: 10,
  },
  input:{
    borderRadius:12,
    backgroundColor:'#fff',
    padding:10,
    fontSize:16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex:1,
  },
})