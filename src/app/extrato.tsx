import { calcularSaldo, dataParaExibir, excluirLancamento, formatarMoeda, listarLancamentos } from "@/lib/lancamentos";
import { cores, mono } from "@/theme";
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
      <Text style={styles.comando}>$ tail -n {lista.length} extrato.log</Text>
      <ActivityIndicator animating={carregando} size='large' color={cores.azul} />

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id!}
        ListEmptyComponent={
          carregando ? undefined : <Text style={styles.vazio}>Nenhum lançamento ainda. Registra o primeiro.</Text>
        }
        renderItem={({ item }) => {
          const entrada = item.tipo === 'entrada';
          const cor = entrada ? cores.verde : cores.vermelho;
          const etiqueta = entrada ? 'ENTRADA' : 'SAIDA';
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mono}>{dataParaExibir(item.data)} <Text style={{ color: cor }}>[{etiqueta}]</Text></Text>
                <Text style={styles.obs}>{item.observacao}</Text>
                <Pressable onPress={() => confirmarExclusao(item)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </Pressable>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.valor, { color: cor }]}>{entrada ? '+' : '-'}{formatarMoeda(item.valor)}</Text>
                <Text style={styles.mono}>saldo {formatarMoeda(item.saldoApos)}</Text>
              </View>
            </View>
          );
        }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  comando: { fontFamily: mono, color: cores.verde, fontSize: 14, marginBottom: 8 },
  card: { flexDirection: 'row', borderBottomWidth: 1, borderColor: cores.borda, paddingVertical: 12 },
  mono: { fontFamily: mono, fontSize: 12, color: cores.muted },
  obs: { fontSize: 15, color: cores.texto, marginTop: 2 },
  valor: { fontFamily: mono, fontSize: 16, fontWeight: 'bold' },
  excluir: { fontSize: 13, color: cores.muted, textDecorationLine: 'underline', marginTop: 4 },
  vazio: { textAlign: 'center', marginTop: 32, fontSize: 16, color: cores.muted }
});
