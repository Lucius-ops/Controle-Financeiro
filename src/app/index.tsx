import { calcularSaldo, formatarMoeda, listarLancamentos } from "@/lib/lancamentos";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function Index() {
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  // Roda toda vez que a tela volta a aparecer, então o saldo fica em dia depois de um lançamento
  useFocusEffect(
    useCallback(() => {
      async function consultar() {
        setCarregando(true);
        try {
          const lista = await listarLancamentos(auth.currentUser!.uid);
          setSaldo(calcularSaldo(lista));
        } catch (e) {
          Alert.alert('Erro ao consultar o saldo', String(e));
        } finally {
          setCarregando(false);
        }
      }
      consultar();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.email}>{auth.currentUser?.email}</Text>

      <Text style={styles.rotulo}>Saldo atual</Text>
      {carregando
        ? <ActivityIndicator size='large' />
        : <Text style={[styles.saldo, { color: saldo < 0 ? 'red' : 'green' }]}>{formatarMoeda(saldo)}</Text>}

      <Pressable style={styles.botao} onPress={() => router.navigate('/lancar')}>
        <Text style={styles.textoBotao}>Lançar valor</Text>
      </Pressable>

      <Pressable style={styles.botao} onPress={() => router.navigate('/transferir')}>
        <Text style={styles.textoBotao}>Transferir ou pagar</Text>
      </Pressable>

      <Pressable style={styles.botao} onPress={() => router.navigate('/extrato')}>
        <Text style={styles.textoBotao}>Ver extrato</Text>
      </Pressable>

      <Pressable onPress={() => signOut(auth)}>
        <Text style={styles.sair}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  email: { fontSize: 14, color: '#666', marginBottom: 32 },
  rotulo: { fontSize: 18 },
  saldo: { fontSize: 44, fontWeight: 'bold', marginBottom: 32 },
  botao: { backgroundColor: '#0a58ca', padding: 12, borderRadius: 6, marginTop: 12, width: 220, alignItems: 'center' },
  textoBotao: { color: 'white', fontSize: 18 },
  sair: { fontSize: 16, marginTop: 32, textDecorationLine: 'underline' }
});
