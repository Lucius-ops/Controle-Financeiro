import { calcularSaldo, formatarMoeda, hojeEmTexto, dataParaISO, inserirLancamento, listarLancamentos, valorParaNumero } from "@/lib/lancamentos";
import { Lancamento } from "@/types/Lancamento";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { auth } from "../../firebaseConfig";

type Forma = 'transferencia' | 'pix' | 'boleto';

const nomes: Record<Forma, string> = {
  transferencia: 'Transferência',
  pix: 'Pix',
  boleto: 'Boleto'
};

function Campo({ rotulo, ...props }: { rotulo: string } & TextInputProps) {
  return (
    <View>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

export default function Transferir() {
  const [forma, setForma] = useState<Forma>('pix');
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [favorecido, setFavorecido] = useState('');
  const [chave, setChave] = useState('');
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const router = useRouter();

  useEffect(() => {
    async function consultarSaldo() {
      try {
        const lista = await listarLancamentos(auth.currentUser!.uid);
        setSaldo(calcularSaldo(lista));
      } catch (e) {
        Alert.alert('Erro ao consultar o saldo', String(e));
      } finally {
        setCarregando(false);
      }
    }
    consultarSaldo();
  }, []);

  // Confere os campos e devolve o texto que vai para o extrato, ou null se algo estiver errado
  function montarObservacao(): string | null {
    let obs = '';

    if (forma === 'transferencia') {
      if (banco.trim() === '' || agencia.trim() === '' || conta.trim() === '' || favorecido.trim() === '') {
        Alert.alert('Preencha banco, agência, conta e nome do favorecido.');
        return null;
      }
      obs = `Transferência para ${favorecido.trim()} (${banco.trim()}, ag ${agencia.trim()}, cc ${conta.trim()})`;
    }

    if (forma === 'pix') {
      if (chave.trim() === '') {
        Alert.alert('Informe a chave Pix: CPF, e-mail, telefone ou chave aleatória.');
        return null;
      }
      obs = `Pix para ${chave.trim()}`;
    }

    if (forma === 'boleto') {
      const digitos = codigo.replace(/\D/g, '');
      if (![44, 47, 48].includes(digitos.length)) {
        Alert.alert('O código do boleto está incompleto. Confira os números.');
        return null;
      }
      obs = `Boleto final ${digitos.slice(-6)}`;
    }

    if (descricao.trim() !== '') {
      obs += ` - ${descricao.trim()}`;
    }
    return obs;
  }

  function confirmar() {
    const numero = valorParaNumero(valor);
    if (valor.trim() === '' || Number.isNaN(numero) || numero <= 0) {
      Alert.alert('Informe um valor maior que zero, por exemplo 150,00.');
      return;
    }
    if (numero > saldo) {
      Alert.alert('Saldo insuficiente', `Você tem ${formatarMoeda(saldo)} disponíveis.`);
      return;
    }
    const obs = montarObservacao();
    if (obs === null) {
      return;
    }

    Alert.alert(
      `Confirmar ${nomes[forma]}`,
      `${formatarMoeda(numero)}\n${obs}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => enviar(Math.round(numero * 100) / 100, obs) }
      ]
    );
  }

  async function enviar(numero: number, obs: string) {
    setCarregando(true);
    try {
      const lancamento: Lancamento = {
        tipo: 'saida',
        valor: numero,
        data: dataParaISO(hojeEmTexto())!,
        observacao: obs,
        forma: forma
      };
      await inserirLancamento(auth.currentUser!.uid, lancamento);
      Alert.alert(`${nomes[forma]} realizado`);
      router.back();
    } catch (e) {
      Alert.alert('Erro ao enviar.', String(e));
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.saldo}>Saldo disponível: {formatarMoeda(saldo)}</Text>

      <View style={styles.linha}>
        {(Object.keys(nomes) as Forma[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.opcao, forma === f && { backgroundColor: '#0a58ca' }]}
            onPress={() => setForma(f)}>
            <Text style={[styles.textoOpcao, forma === f && { color: 'white' }]}>{nomes[f]}</Text>
          </Pressable>
        ))}
      </View>

      {forma === 'transferencia' && (
        <>
          <Campo rotulo='Banco' value={banco} onChangeText={setBanco} />
          <Campo rotulo='Agência' value={agencia} onChangeText={setAgencia} keyboardType='number-pad' />
          <Campo rotulo='Conta' value={conta} onChangeText={setConta} keyboardType='number-pad' />
          <Campo rotulo='Nome do favorecido' value={favorecido} onChangeText={setFavorecido} />
        </>
      )}

      {forma === 'pix' && (
        <Campo
          rotulo='Chave Pix'
          value={chave}
          onChangeText={setChave}
          autoCapitalize='none'
          autoCorrect={false} />
      )}

      {forma === 'boleto' && (
        <Campo
          rotulo='Código de barras ou linha digitável'
          value={codigo}
          onChangeText={setCodigo}
          keyboardType='number-pad' />
      )}

      <Campo rotulo='Valor (R$)' value={valor} onChangeText={setValor} keyboardType='decimal-pad' placeholder='0,00' />
      <Campo rotulo='Descrição (opcional)' value={descricao} onChangeText={setDescricao} maxLength={40} />

      <Pressable style={styles.botao} onPress={confirmar} disabled={carregando}>
        <Text style={styles.textoBotao}>Continuar</Text>
      </Pressable>

      <ActivityIndicator animating={carregando} size='large' />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  saldo: { fontSize: 16, marginBottom: 16 },
  linha: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  opcao: { flex: 1, borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, alignItems: 'center' },
  textoOpcao: { fontSize: 15, fontWeight: 'bold' },
  rotulo: { fontSize: 14, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, fontSize: 16 },
  botao: { backgroundColor: 'green', padding: 12, borderRadius: 6, marginVertical: 24, alignItems: 'center' },
  textoBotao: { color: 'white', fontSize: 18 }
});
