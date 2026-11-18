export interface UserSeed {
  id: number;
  nome: string;
  login: string;
  senha: string;
  perfil: 'ADMIN' | 'VENDEDOR';
  ativo: boolean;
}

export const users: UserSeed[] = [
  {
    id: 1,
    nome: 'Rafaela Ferrari',
    login: 'rafaela.ferrari',
    senha: 'admin123',
    perfil: 'ADMIN',
    ativo: true
  },
  {
    id: 2,
    nome: 'Davi Silva',
    login: 'davi.silva',
    senha: '123456',
    perfil: 'VENDEDOR',
    ativo: true
  },
  {
    id: 3,
    nome: 'Davi Barbosa',
    login: 'davi.barbosa',
    senha: '123456',
    perfil: 'VENDEDOR',
    ativo: true
  },
  {
    id: 4,
    nome: 'Vinicius Kauan',
    login: 'vinicius.kauan',
    senha: '123456',
    perfil: 'VENDEDOR',
    ativo: true
  }
];
