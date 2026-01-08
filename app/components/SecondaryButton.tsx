import { LinearGradient } from "expo-linear-gradient";
import { Pressable } from "react-native";
import { styles } from "../Styles";
import { AppText } from "./AppText";

export function SecondaryButton(props: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={{ width: "100%" }}>
      <LinearGradient
        colors={["#1F2636", "#0E1320"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gbtn}
      >
        <AppText style={styles.gbtnTextSecondary}>{props.title}</AppText>
      </LinearGradient>
    </Pressable>
  );
}