type Lancamento = {
  id?: string,
  tipo: 'entrada' | 'saida',
  valor: number,
  data: string, // AAAA-MM-DD, assim a ordenação por texto já respeita a data
  observacao: string,
  forma?: 'transferencia' | 'pix' | 'boleto' // só nos pagamentos feitos pela tela de transferir
}

export type { Lancamento };
