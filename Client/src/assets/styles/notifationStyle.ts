import { StyleSheet, Dimensions } from 'react-native';
import { Colors, mainColor } from '@/src/constants/theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.textMain,
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  rowFrontVisible: {
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unreadItem: {
    borderColor: mainColor,
    backgroundColor: '#F0FDFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textMain,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: mainColor,
  },
  description: {
    fontSize: 13,
    color: Colors.light.textSub,
    lineHeight: 18,
    marginBottom: 8,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.light.textSub,
    fontWeight: '500',
  },
  /* Hidden Item Style */
  rowBack: {
    alignItems: 'center',
    backgroundColor: Colors.light.error,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  backRightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: '100%',
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default styles;
