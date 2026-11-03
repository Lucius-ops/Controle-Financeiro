type Lancamento = {
  id?: string,
  tipo: 'entrada' | 'saida',
  valor: number,
  data: string, // AAAA-MM-DD, assim a ordenação por texto já respeita a data
  observacao: string
}

export type { Lancamento };
