import Botao from "@/components/Botao";
import Campo from "@/components/Campo";
import { cores, mono } from "@/theme";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../../firebaseConfig";

function mensagemDeErro(e: any) {
  switch (e?.code) {
    case 'auth/invalid-email': return 'O e-mail informado não é válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use': return 'Esse e-mail já tem conta. Usa a opção Entrar.';
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
      <Text style={styles.titulo}>$ ./lucius_bank</Text>
      <Text style={styles.sub}>{novaConta ? 'Cria a tua conta.' : 'Entra na tua conta.'}</Text>

      <Campo rotulo='E-mail' value={email} onChangeText={setEmail}
        keyboardType='email-address' autoCapitalize='none' autoCorrect={false} />
      <Campo rotulo='Senha' value={senha} onChangeText={setSenha} secureTextEntry />

      <Botao titulo={novaConta ? 'Criar conta' : 'Entrar'} onPress={enviar} disabled={carregando} />

      <Pressable onPress={() => setNovaConta(!novaConta)}>
        <Text style={styles.link}>{novaConta ? 'Já tenho conta' : 'Ainda não tenho conta'}</Text>
      </Pressable>

      <ActivityIndicator animating={carregando} size='large' color={cores.azul} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: cores.verde, fontFamily: mono },
  sub: { fontSize: 16, color: cores.muted, marginTop: 4, marginBottom: 12 },
  link: { fontSize: 16, color: cores.azul, textAlign: 'center', marginVertical: 20 }
});
