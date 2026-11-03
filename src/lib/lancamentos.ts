import { Lancamento } from "@/types/Lancamento";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Cada usuário tem a sua própria coleção: usuarios/{uid}/lancamentos
function colecao(uid: string) {
  return collection(db, 'usuarios', uid, 'lancamentos');
}

export async function listarLancamentos(uid: string): Promise<Lancamento[]> {
  const snap = await getDocs(query(colecao(uid), orderBy('data', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lancamento);
}

export async function inserirLancamento(uid: string, lancamento: Lancamento) {
  await addDoc(colecao(uid), lancamento);
}

export async function excluirLancamento(uid: string, id: string) {
  await deleteDoc(doc(db, 'usuarios', uid, 'lancamentos', id));
}

export function calcularSaldo(lista: Lancamento[]) {
  const total = lista.reduce((soma, l) => (l.tipo === 'entrada' ? soma + l.valor : soma - l.valor), 0);
  return Math.round(total * 100) / 100;
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function dataParaExibir(iso: string) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function hojeEmTexto() {
  const h = new Date();
  return `${String(h.getDate()).padStart(2, '0')}/${String(h.getMonth() + 1).padStart(2, '0')}/${h.getFullYear()}`;
}

// Recebe DD/MM/AAAA e devolve AAAA-MM-DD, ou null se a data não existir
export function dataParaISO(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// Aceita "1.234,56", "1234,56" ou "1234.56"
export function valorParaNumero(texto: string) {
  let t = texto.replace(/R\$|\s/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  return Number(t);
}
