import { cores } from "@/theme";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

export default function Campo({ rotulo, ...props }: { rotulo: string } & TextInputProps) {
  return (
    <View>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput style={styles.input} placeholderTextColor={cores.muted} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontSize: 14, marginTop: 12, marginBottom: 4, color: cores.muted },
  input: {
    borderWidth: 1, borderColor: cores.borda, borderRadius: 6, padding: 10,
    fontSize: 16, color: cores.texto, backgroundColor: cores.superficie
  }
});
