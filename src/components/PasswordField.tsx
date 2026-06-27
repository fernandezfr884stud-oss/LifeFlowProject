import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

/*
  Reusable PasswordField component.

  Purpose:
  - Ginagamit sa Password and Confirm Password fields.
  - May eye icon para show/hide password.
  - Pwede rin gamitin later sa login.tsx.
*/
type PasswordFieldProps = {
  placeholder: string;
  value: string;
  visible: boolean;
  onChangeText: (text: string) => void;
  onToggle: () => void;
};

export default function PasswordField({
  placeholder,
  value,
  visible,
  onChangeText,
  onToggle,
}: PasswordFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={!visible}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />

      <TouchableOpacity onPress={onToggle} style={styles.eyeButton}>
        <Ionicons
          name={visible ? "eye-outline" : "eye-off-outline"}
          size={22}
          color="#777"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F1F1",
    height: 55,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 15,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 15,
  },

  eyeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});