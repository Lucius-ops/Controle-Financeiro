import Botao from "@/components/Botao";
import Campo from "@/components/Campo";
import { dataParaISO, hojeEmTexto, inserirLancamento, valorParaNumero } from "@/lib/lancamentos";
import { cores } from "@/theme";
import { Lancamento } from "@/types/Lancamento";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
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
          style={[styles.tipo, tipo === 'entrada' && { backgroundColor: cores.verde, borderColor: cores.verde }]}
          onPress={() => setTipo('entrada')}>
          <Text style={[styles.textoTipo, tipo === 'entrada' && { color: cores.escuro }]}>Recebi</Text>
        </Pressable>
        <Pressable
          style={[styles.tipo, tipo === 'saida' && { backgroundColor: cores.vermelho, borderColor: cores.vermelho }]}
          onPress={() => setTipo('saida')}>
          <Text style={[styles.textoTipo, tipo === 'saida' && { color: cores.escuro }]}>Paguei</Text>
        </Pressable>
      </View>

      <Campo rotulo='Valor (R$)' value={valor} onChangeText={setValor} keyboardType='decimal-pad' placeholder='0,00' />
      <Campo rotulo='Data' value={data} onChangeText={mudarData} keyboardType='number-pad' placeholder='DD/MM/AAAA' />
      <Campo rotulo='Observação' value={observacao} onChangeText={setObservacao} maxLength={80} placeholder='Ex.: aluguel de novembro' />

      <Botao titulo='Salvar' cor={cores.verde} onPress={salvar} disabled={carregando} />

      <ActivityIndicator animating={carregando} size='large' color={cores.azul} style={{ marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  linha: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  tipo: { flex: 1, borderWidth: 1, borderColor: cores.borda, borderRadius: 6, padding: 12, alignItems: 'center' },
  textoTipo: { fontSize: 18, fontWeight: 'bold', color: cores.texto }
});
