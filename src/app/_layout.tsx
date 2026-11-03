import { cores } from "@/theme";
import { Stack } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function RootLayout() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // O Firebase avisa sempre que alguém entra ou sai
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size='large' color={cores.azul} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: cores.superficie },
      headerTintColor: cores.texto,
      contentStyle: { backgroundColor: cores.fundo }
    }}>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="index" options={{ title: 'Minha conta' }} />
        <Stack.Screen name="lancar" options={{ title: 'Novo lançamento' }} />
        <Stack.Screen name="extrato" options={{ title: 'Extrato' }} />
      </Stack.Protected>

      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
