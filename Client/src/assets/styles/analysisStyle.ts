import { StyleSheet } from "react-native";
import { Colors, Fonts } from "@/src/constants/theme";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // header
    headerBg: {
        backgroundColor: Colors.light.primary,
        height: 100,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        zIndex: 10,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    navTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Fonts.rounded,
    },
    scrollView: {
        flex: 1,
        marginTop: -20, // Pull up to overlap with header
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 40,
    },
    
    // selecte time 
    selecteTime:{
        marginTop:10,
        marginBottom:10,
        gap:10,
        flexDirection: 'row', 
    },
    row: {
        flexDirection: 'row', 
        alignItems: 'center', 
    },
    selecteTimeBTn:{
        backgroundColor: "#FFFFFF",
        borderRadius:10,
        borderWidth:1.4,
        borderStyle: "solid",
        borderColor:"#29dfff",
        padding:7,
        flexDirection:'row',
        alignItems:'center',
        gap:7,
    },
    selecteTimeText:{
        fontWeight:"600",
        color:Colors.light.primary,
        shadowColor: '#fff', 
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.textMain,
    },
    seeMoreText: {
        fontSize: 14,
        color: Colors.light.primary,
        fontWeight: '600',
    },

    /* Segment Control */
  segmentControlContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSub,
  },
  segmentTextActive: {
    color: '#FFF',
  },
  // Bottom Stats
  bottomStats: {
    marginTop: 30,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statRow: {
    marginVertical: 10,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSub,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.textMain,
    fontFamily: Fonts.rounded,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 22,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
})
export default styles;