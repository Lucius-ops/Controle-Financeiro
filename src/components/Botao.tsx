import { cores } from "@/theme";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = { titulo: string, onPress: () => void, cor?: string, disabled?: boolean };

export default function Botao({ titulo, onPress, cor = cores.azul, disabled }: Props) {
  return (
    <Pressable
      style={[styles.botao, { backgroundColor: cor }, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { padding: 12, borderRadius: 6, marginTop: 16, alignItems: 'center' },
  texto: { color: cores.escuro, fontSize: 17, fontWeight: 'bold' }
});
