import { Platform } from "react-native";

export const cores = {
  fundo: '#0D1117',
  superficie: '#161B22',
  borda: '#30363D',
  texto: '#E6EDF3',
  muted: '#8B949E',
  verde: '#3FB950',
  vermelho: '#F85149',
  azul: '#58A6FF',
  escuro: '#0D1117'
};

export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
