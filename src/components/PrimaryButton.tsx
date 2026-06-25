import { TouchableOpacity, Text, StyleSheet } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Main Button
  button: {
    width: "85%",
    height: 70,

    backgroundColor: "#FFFFFF",

    borderRadius: 40,

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",
  },

  // Button Text
    buttonText: {
      color: "#2B0000",
      fontSize: 22,
      fontWeight: "bold",
    },
});