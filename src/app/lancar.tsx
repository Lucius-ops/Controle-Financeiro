import { dataParaISO, hojeEmTexto, inserirLancamento, valorParaNumero } from "@/lib/lancamentos";
import { Lancamento } from "@/types/Lancamento";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function Lancar() {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(hojeEmTexto());
  const [observacao, setObservacao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  // Deixa só os números e coloca as barras sozinho: 03112026 vira 03/11/2026
  function mudarData(texto: string) {
    const n = texto.replace(/\D/g, '').slice(0, 8);
    let r = n;
    if (n.length > 4) r = `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
    else if (n.length > 2) r = `${n.slice(0, 2)}/${n.slice(2)}`;
    setData(r);
  }

  async function salvar() {
    const numero = valorParaNumero(valor);
    if (valor.trim() === '' || Number.isNaN(numero) || numero <= 0) {
      Alert.alert('Informe um valor maior que zero, por exemplo 150,00.');
      return;
    }
    const iso = dataParaISO(data);
    if (iso === null) {
      Alert.alert('A data é inválida. Use o formato DD/MM/AAAA.');
      return;
    }
    if (observacao.trim() === '') {
      Alert.alert('Escreva uma observação dizendo a que se refere.');
      return;
    }

    setCarregando(true);
    try {
      const lancamento: Lancamento = {
        tipo: tipo,
        valor: Math.round(numero * 100) / 100,
        data: iso,
        observacao: observacao.trim()
      };
      await inserirLancamento(auth.currentUser!.uid, lancamento);
      Alert.alert('Lançamento salvo');
      router.back();
    } catch (e) {
      Alert.alert('Erro ao salvar.', String(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        <Pressable
          style={[styles.tipo, tipo === 'entrada' && { backgroundColor: 'green' }]}
          onPress={() => setTipo('entrada')}>
          <Text style={[styles.textoTipo, tipo === 'entrada' && { color: 'white' }]}>Recebi</Text>
        </Pressable>
        <Pressable
          style={[styles.tipo, tipo === 'saida' && { backgroundColor: 'red' }]}
          onPress={() => setTipo('saida')}>
          <Text style={[styles.textoTipo, tipo === 'saida' && { color: 'white' }]}>Paguei</Text>
        </Pressable>
      </View>

      <Text style={styles.rotulo}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType='decimal-pad'
        placeholder='0,00' />

      <Text style={styles.rotulo}>Data</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={mudarData}
        keyboardType='number-pad'
        placeholder='DD/MM/AAAA' />

      <Text style={styles.rotulo}>Observação</Text>
      <TextInput
        style={styles.input}
        value={observacao}
        onChangeText={setObservacao}
        maxLength={80}
        placeholder='Ex.: aluguel de novembro' />

      <Pressable style={styles.botao} onPress={salvar} disabled={carregando}>
        <Text style={styles.textoBotao}>Salvar</Text>
      </Pressable>

      <ActivityIndicator animating={carregando} size='large' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  linha: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  tipo: { flex: 1, borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 12, alignItems: 'center' },
  textoTipo: { fontSize: 18, fontWeight: 'bold' },
  rotulo: { fontSize: 14, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, fontSize: 16 },
  botao: { backgroundColor: 'green', padding: 12, borderRadius: 6, marginVertical: 24, alignItems: 'center' },
  textoBotao: { color: 'white', fontSize: 18 }
});
