import { StyleSheet } from "react-native";
import { Colors } from "@/src/constants/theme";

export const styles = StyleSheet.create({
  /* CALENDAR CARD */
  calendarCard: {
    position: "absolute",
    top: 0,
    bottom: 0,
    start: 0,
    end: 0,
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    borderRadius: 24,
    padding: 16,
    width: 300,
    backgroundColor: "#fff",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    padding: 10,
  },
  calendarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.textMain,
    textTransform: "lowercase",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 10,
  },
  weekDayText: {
    fontSize: 12,
    color: Colors.light.textSub,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    gap: 10,
  },
  dayCell: {
    width: "11%",
    alignItems: "center",
    marginBottom: 10,
    minHeight: 40,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleSelected: {
    backgroundColor: Colors.light.primary, // Selected = Sky Blue
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dayText: {
    fontSize: 14,
    color: Colors.light.textMain,
    fontWeight: "600",
  },
  textError: {
    color: Colors.light.error,
  },
  textGreen: {
    color: Colors.light.success,
    fontWeight: "bold",
  },
  textRed: {
    color: Colors.light.error,
    fontWeight: "bold",
  },
  textWhite: {
    color: "#FFF",
  },
});
