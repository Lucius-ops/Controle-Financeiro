import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../firebaseConfig";

function mensagemDeErro(e: any) {
  switch (e?.code) {
    case 'auth/invalid-email': return 'O e-mail informado não é válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use': return 'Esse e-mail já tem conta. Use a opção Entrar.';
    case 'auth/weak-password': return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/network-request-failed': return 'Sem conexão com a internet.';
    default: return String(e);
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [novaConta, setNovaConta] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (email.trim() === '') {
      Alert.alert('Campo "E-mail" em branco.');
      return;
    }
    if (senha === '') {
      Alert.alert('Campo "Senha" em branco.');
      return;
    }

    setCarregando(true);
    try {
      if (novaConta) {
        await createUserWithEmailAndPassword(auth, email.trim(), senha);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), senha);
      }
      // Não precisa navegar: o layout troca de tela quando o login funciona
    } catch (e) {
      Alert.alert(novaConta ? 'Não foi possível criar a conta' : 'Não foi possível entrar', mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu extrato</Text>

      <Text style={styles.rotulo}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
        autoCorrect={false} />

      <Text style={styles.rotulo}>Senha</Text>
      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry />

      <Pressable style={styles.botao} onPress={enviar} disabled={carregando}>
        <Text style={styles.textoBotao}>{novaConta ? 'Criar conta' : 'Entrar'}</Text>
      </Pressable>

      <Pressable onPress={() => setNovaConta(!novaConta)}>
        <Text style={styles.link}>
          {novaConta ? 'Já tenho conta' : 'Ainda não tenho conta'}
        </Text>
      </Pressable>

      <ActivityIndicator animating={carregando} size='large' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  rotulo: { fontSize: 14, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, fontSize: 16 },
  botao: { backgroundColor: 'green', padding: 12, borderRadius: 6, marginTop: 24, alignItems: 'center' },
  textoBotao: { color: 'white', fontSize: 18 },
  link: { fontSize: 16, color: '#0a58ca', textAlign: 'center', marginVertical: 16 }
});
