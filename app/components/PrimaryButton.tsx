import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable } from "react-native";
import styles from "../Styles";
import AppText from "./AppText";

export default function PrimaryButton(props: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={props.onPress} disabled={props.disabled} style={{ width: "100%" }}>
      <LinearGradient
        colors={props.disabled ? ["#2C3340", "#2C3340"] : ["#3FAF6C", "#1B3A2A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gbtn, props.disabled && { opacity: 0.55 }]}
      >
        <AppText style={styles.gbtnText}>{props.title}</AppText>
      </LinearGradient>
    </Pressable>
  );
}