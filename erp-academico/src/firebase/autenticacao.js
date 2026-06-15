// Funções de autenticação — login e logout
import {
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from './configuracao';

// Traduz os códigos de erro do Firebase para mensagens em português
function traduzirErro(codigoErro) {
  const erros = {
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-email': 'E-mail inválido',
    'auth/user-disabled': 'Usuário desativado',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/invalid-credential': 'E-mail ou senha incorretos',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
  };
  return erros[codigoErro] || 'Erro ao fazer login. Tente novamente';
}

// Faz login com e-mail e senha usando o Firebase Auth
//função assincrona espera a resposta do servidor do firebase para saber se o login foi bem sucedido ou não.
export async function entrarComEmail(email, senha) {
  try {
    const resultado = await signInWithEmailAndPassword(auth, email, senha);
    return { sucesso: true, usuario: resultado.user };//se o login for bem sucedido, retorna o usuário logado
  } catch (erro) {
    return { sucesso: false, mensagem: traduzirErro(erro.code) };//se o login falhar, retorna a mensagem de erro traduzida
  }
}

// Faz logout do sistema
export async function sairDoSistema() {
  try {
    await signOut(auth);
    return { sucesso: true };//se o logout for bem sucedido, retorna sucesso
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao sair do sistema' };//se o logout falhar, retorna a mensagem de erro
  }
}

