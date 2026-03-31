import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';

interface AutoBudgetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  status: 'idle' | 'loading' | 'generating'; // Quản lý các trạng thái như bạn mô tả
}

const PRIMARY_COLOR = '#12D0FF';

const AutoBudgetModal: React.FC<AutoBudgetModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  status,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Hiệu ứng xoay icon khi loading
  useEffect(() => {
    if (status !== 'idle') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [status]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Khu vực Robot bên trái */}
          <View style={styles.robotContainer}>
            <View style={styles.robotImage}>
                <Image
                    source={require('../assets/images/welcome.png')}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
          </View>

          {/* Khu vực Tin nhắn (Modal chính) bên phải */}
          <View style={styles.bubbleContainer}>
            <View style={styles.messageBubble}>
              {/* Nút X để đóng nhanh */}
              <TouchableOpacity style={styles.closeX} onPress={onClose}>
                <Text style={{ color: '#999', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>

              {status === 'idle' ? (
                <View style={styles.bubbleContent}>
                  <Text style={styles.title}>AI Budget Suggestions</Text>
                  <Text style={styles.message}>
                    Bạn chưa lập ngân sách cho tháng này. Bạn có muốn tôi kế hoạch chi tiêu tháng này dựa trên hoạt động chi tiêu hoặc số tiền trong ví của bạn không?
                  </Text>
                  
                  <TouchableOpacity style={styles.mainButton} onPress={onConfirm}>
                    <Text style={styles.buttonText}>Agree</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                  </Animated.View>
                  <Text style={styles.loadingText}>
                    {status === 'loading' ? 'Loading data...' : 'Generating...'}
                  </Text>
                </View>
              )}
            </View>
            {/* Cái "đuôi" của bong bóng tin nhắn */}
            <View style={styles.bubbleTail} />
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'flex-start',
  },
  robotContainer: {
    flex: 1,
    alignItems: 'center',
  },
  robotImage: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius:50,
  },
  image:{
    width: '100%',
    height: '100%',
  },
  bubbleContainer: {
    flex: 2,
    position: 'relative',
  },
  bubbleContent:{
    backgroundColor:'#fff', 
    borderRadius:20,
    padding: 20,
  },
  messageBubble: {
    backgroundColor: PRIMARY_COLOR,
    // borderRadius: 20,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderTopRightRadius:20,
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
  },
  bubbleTail: {
    position: 'absolute',
    left: -15,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    borderRightWidth: 15,
    borderRightColor: PRIMARY_COLOR,
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
  },
  closeX: {
    position: 'absolute',
    right: 12,
    top: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor:'#fff',  
    borderRadius:20,
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default AutoBudgetModal;