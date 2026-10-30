export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  codigoBarras?: string;
  categoria: string;
  ativo: boolean;
}