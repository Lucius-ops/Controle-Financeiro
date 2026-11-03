import { calcularSaldo, dataParaExibir, excluirLancamento, formatarMoeda, listarLancamentos } from "@/lib/lancamentos";
import { Lancamento } from "@/types/Lancamento";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../../firebaseConfig";

type Linha = Lancamento & { saldoApos: number };

export default function Extrato() {
  const [lista, setLista] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function consultar() {
    setCarregando(true);
    try {
      // Já vem ordenado pela data. Aqui só acumulamos o saldo linha a linha.
      const lancamentos = await listarLancamentos(auth.currentUser!.uid);
      const linhas = lancamentos.map((l, i) => ({
        ...l,
        saldoApos: calcularSaldo(lancamentos.slice(0, i + 1))
      }));
      setLista(linhas);
    } catch (e) {
      Alert.alert('Erro ao consultar o extrato', String(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      consultar();
    }, [])
  );

  function confirmarExclusao(l: Linha) {
    Alert.alert('Excluir lançamento', `Excluir "${l.observacao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirLancamento(auth.currentUser!.uid, l.id!);
            consultar();
          } catch (e) {
            Alert.alert('Erro ao excluir', String(e));
          }
        }
      }
    ]);
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={carregando} size='large' />

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id!}
        ListEmptyComponent={
          carregando ? undefined : <Text style={styles.vazio}>Nenhum lançamento ainda.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.data}>{dataParaExibir(item.data)}</Text>
              <Text style={styles.obs}>{item.observacao}</Text>
              <Pressable onPress={() => confirmarExclusao(item)}>
                <Text style={styles.excluir}>Excluir</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 18, color: item.tipo === 'entrada' ? 'green' : 'red' }}>
                {item.tipo === 'entrada' ? '+ ' : '- '}{formatarMoeda(item.valor)}
              </Text>
              <Text style={styles.saldo}>Saldo {formatarMoeda(item.saldoApos)}</Text>
            </View>
          </View>
        )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 12 },
  data: { fontSize: 13, color: '#666' },
  obs: { fontSize: 16 },
  excluir: { fontSize: 13, color: '#666', textDecorationLine: 'underline', marginTop: 4 },
  saldo: { fontSize: 13, color: '#666', marginTop: 4 },
  vazio: { textAlign: 'center', marginTop: 32, fontSize: 16 }
});
