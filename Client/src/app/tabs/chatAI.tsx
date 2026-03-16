import {
  Text, View, KeyboardAvoidingView, StyleSheet,Animated,
  TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "@/src/constants/theme";
import { TextInput } from "react-native-gesture-handler";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState, useRef } from "react";
import { IMessage } from "@/src/models/interface/DTO";
import { ChatBotApp } from "@/src/store/application/chatApp";
import { useProvider } from "@/src/hooks/useProvider";
import { useEffect, useMemo } from "react";

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
    };
    Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ]).start();
  }, []);

  return (
    <View style={styles.dotContainer}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

export default function ChatAI() {
  const { walletScreen, id, accessToken } = useProvider();
  const _app = useMemo(() => 
    new ChatBotApp({id, accessToken}, walletScreen.rawData.wallets), 
    [id, accessToken, walletScreen]
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostMess = async (mess: string) => {
    if (!mess.trim() || loading) return;

    const userMessage: IMessage = {
      text: mess.trim(),
      createdAt: new Date().toISOString(),
      from: "user",
    };

    setMessages(pre => [...pre, userMessage]);
    setNewMessageText('');
    setLoading(true);

    const res = await _app.post(userMessage);

    const botMessage: IMessage = {
      text: res.status && res.reply ? res.reply : (res.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.'),
      createdAt: new Date().toISOString(),
      from: "chatApp",
    };

    setMessages(pre => [...pre, botMessage]);
    setLoading(false);
  };

  const renderMess = (mess: IMessage, index: number) => {
    const isBot = mess.from === "chatApp";
    return (
      <View key={index} style={[styles.messContainer, isBot ? styles.botAlign : styles.userAlign]}>
        {isBot && (
          <Image source={require("../../assets/images/welcome.png")} style={styles.miniAvatar} />
        )}
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={[styles.messText, isBot ? styles.botText : styles.userText]}>
            {mess.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Header tinh tế hơn */}
      {/* <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Image
            style={styles.chatIcon}
            source={require("../../assets/images/welcome.png")}
          />
          <View>
            <Text style={styles.headerTitle}>AuBud AI</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity>
           <MaterialIcons name="more-vert" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View> */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.intro}>
              <View style={styles.introIconCircle}>
                <Image source={require("../../assets/images/welcome.png")} style={styles.largeIntroIcon} />
              </View>
              <Text style={styles.chatName}>Xin chào, tôi là AuBud</Text>
              <Text style={styles.introText}>Tôi có thể giúp gì cho bạn hôm nay?</Text>
            </View>
          ) : (
            messages.map((mess, index) => renderMess(mess, index))
          )}

          {loading && (
            <View style={[styles.messContainer, styles.botAlign]}>
              <Image source={require("../../assets/images/welcome.png")} style={styles.miniAvatar} />
              <View style={[styles.bubble, styles.botBubble, { paddingVertical: 15 }]}>
                <TypingIndicator />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setNewMessageText}
              multiline
              value={newMessageText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: newMessageText.trim() ? Colors.light.primary : '#E1E1E1' }
              ]}
              disabled={!newMessageText.trim() || loading}
              onPress={() => handlePostMess(newMessageText)}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Màu nền xám cực nhẹ giúp bong bóng chat trắng nổi bật hơn
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  intro: {
    alignItems: 'center',
    marginTop: 60,
  },
  introIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  largeIntroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  chatName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  messContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userAlign: {
    alignSelf: 'flex-end',
  },
  botAlign: {
    alignSelf: 'flex-start',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: Colors.light.primary, // Màu chính của bạn
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  messText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  loadingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: '#fff',
    // borderTopWidth: 1,
    // borderTopColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dotContainer: { flexDirection: 'row', gap: 4, width: 40, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.light.primary },
});