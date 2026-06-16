// Funções CRUD genéricas para o Firestore (banco de dados do Firebase)
// Cada função recebe o nome da coleção e executa a operação correspondente
// São genéricas: servem para qualquer coleção (cursos, alunos, matriculas)
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './configuracao';

// CREATE — Cria um novo documento na coleção informada
// Recebe o nome da coleção (ex: 'alunos') e os dados a serem salvos
// Adiciona automaticamente o campo 'criadoEm' com a data/hora atual
export async function criarDocumento(colecao, dados) {
  try {
    // addDoc gera um ID único automaticamente para o novo documento
    const ref = await addDoc(collection(db, colecao), {
      ...dados, // spread operator: copia todos os campos de 'dados'
      criadoEm: new Date().toISOString() // timestamp de criação
    });
    return { sucesso: true, id: ref.id };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao criar registro: ' + erro.message };
  }
}

// READ (todos) — Busca todos os documentos de uma coleção
// Retorna um array de objetos, cada um com seu ID + dados
export async function buscarTodos(colecao) {
  try {
    // getDocs retorna um 'snapshot' com todos os documentos da coleção
    const snapshot = await getDocs(collection(db, colecao));
    // map() transforma cada documento em um objeto { id, ...campos }
    const dados = snapshot.docs.map((d) => ({
      id: d.id,     // ID gerado pelo Firestore
      ...d.data()   // campos do documento (nome, email, etc.)
    }));
    return { sucesso: true, dados };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao buscar dados: ' + erro.message };
  }
}

// UPDATE — Atualiza um documento existente pelo ID
// Recebe a coleção, o ID do documento e os novos dados
// Adiciona automaticamente o campo 'atualizadoEm' com a data/hora atual
export async function atualizarDocumento(colecao, id, dados) {
  try {
    // doc() cria uma referência ao documento específico pelo ID
    const docRef = doc(db, colecao, id);
    // updateDoc altera apenas os campos passados (merge parcial)
    await updateDoc(docRef, {
      ...dados,
      atualizadoEm: new Date().toISOString() // timestamp de atualização
    });
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao atualizar registro: ' + erro.message };
  }
}

// DELETE — Exclui um documento pelo ID
// Remove permanentemente o documento da coleção
export async function excluirDocumento(colecao, id) {
  try {
    const docRef = doc(db, colecao, id);
    await deleteDoc(docRef); // exclui o documento do Firestore
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao excluir registro: ' + erro.message };
  }
}
