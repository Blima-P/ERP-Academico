import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './configuracao';

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

export async function entrarComEmail(email, senha) {
  try {
    const resultado = await signInWithEmailAndPassword(auth, email, senha);
    return { sucesso: true, usuario: resultado.user };
  } catch (erro) {
    return { sucesso: false, mensagem: traduzirErro(erro.code) };
  }
}

export async function sairDoSistema() {
  try {
    await signOut(auth);
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao sair do sistema' };
  }
}

export async function enviarRedefinicaoSenha(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { sucesso: true, mensagem: 'E-mail de redefinição enviado!' };
  } catch (erro) {
    const erros = {
      'auth/user-not-found': 'E-mail não cadastrado',
      'auth/invalid-email': 'E-mail inválido'
    };
    return { sucesso: false, mensagem: erros[erro.code] || 'Erro ao enviar e-mail' };
  }
}