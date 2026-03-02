import { StyleSheet } from "react-native";
import { mainColor, Colors } from "@/src/constants/theme";
const light = Colors.light;
const main = Colors.main;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:light.background,
        justifyContent:"center",
        alignItems:"center",
        gap:30
    },
    splashLogo:{
        width:100,
        height: 100,
    },
    splashText:{
        fontSize: 24,
        fontWeight: "500",
        color: light.textMain
    }
})

export default styles;