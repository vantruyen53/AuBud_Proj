import {styles} from '../assets/styles/homeStyle';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import {TouchableOpacity} from 'react-native';
export default function FloatAddBtn(props:any) {
  return (
    <TouchableOpacity style={styles.fab} onPress={props.navigation}>
        <MaterialIcons name={props.name} size={props.size} color="#FFF" />
    </TouchableOpacity>
  )
}