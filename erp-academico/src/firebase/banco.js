import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './configuracao';

export async function criarDocumento(colecao, dados) {
  try {
    const ref = await addDoc(collection(db, colecao), {
      ...dados,
      criadoEm: new Date().toISOString()
    });
    return { sucesso: true, id: ref.id };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao criar registro: ' + erro.message };
  }
}

export async function buscarTodos(colecao) {
  try {
    const snapshot = await getDocs(collection(db, colecao));
    const dados = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    return { sucesso: true, dados };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao buscar dados: ' + erro.message };
  }
}

export async function atualizarDocumento(colecao, id, dados) {
  try {
    const docRef = doc(db, colecao, id);
    await updateDoc(docRef, {
      ...dados,
      atualizadoEm: new Date().toISOString()
    });
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao atualizar registro: ' + erro.message };
  }
}

export async function excluirDocumento(colecao, id) {
  try {
    const docRef = doc(db, colecao, id);
    await deleteDoc(docRef);
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao excluir registro: ' + erro.message };
  }
}
