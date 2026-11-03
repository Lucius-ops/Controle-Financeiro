import Botao from "@/components/Botao";
import { calcularSaldo, formatarMoeda, listarLancamentos } from "@/lib/lancamentos";
import { cores, mono } from "@/theme";
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

      <Text style={styles.rotulo}>$ saldo</Text>
      {carregando
        ? <ActivityIndicator size='large' color={cores.azul} />
        : <Text style={[styles.saldo, { color: saldo < 0 ? cores.vermelho : cores.verde }]}>{formatarMoeda(saldo)}</Text>}

      <View style={{ width: 240 }}>
        <Botao titulo='Lançar valor' onPress={() => router.navigate('/lancar')} />
        <Botao titulo='Ver extrato' onPress={() => router.navigate('/extrato')} />
      </View>

      <Pressable onPress={() => signOut(auth)}>
        <Text style={styles.sair}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  email: { fontSize: 14, color: cores.muted, marginBottom: 32 },
  rotulo: { fontSize: 16, color: cores.muted, fontFamily: mono },
  saldo: { fontSize: 40, fontWeight: 'bold', fontFamily: mono, marginBottom: 24 },
  sair: { fontSize: 16, marginTop: 32, color: cores.muted, textDecorationLine: 'underline' }
});
