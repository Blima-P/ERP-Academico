// Alunos — Página de CRUD completo para gerenciar alunos
// Cada aluno é associado a um curso (chave estrangeira: curso_id)
// Possui Create, Read (com TabelaDados reutilizável), Update e Delete
import { useState, useEffect } from 'react';
import { buscarTodos, criarDocumento, atualizarDocumento, excluirDocumento } from '../../firebase/banco';
import TabelaDados from '../../componentes/TabelaDados/TabelaDados';
import estilos from './Alunos.module.css';

function Alunos() {
  // === ESTADOS (useState) ===
  const [alunos, setAlunos] = useState([]);               // lista de alunos do Firestore
  const [cursos, setCursos] = useState([]);               // lista de cursos (para o select do formulário)
  const [carregando, setCarregando] = useState(true);     // controla o loading da página
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // abre/fecha o modal do form
  const [editando, setEditando] = useState(null);         // se tem valor = modo edição (UPDATE), se null = modo criação (CREATE)
  const [excluindo, setExcluindo] = useState(null);       // guarda o aluno que será excluído (abre modal de confirmação)
  const [busca, setBusca] = useState('');                  // texto digitado no campo de busca
  const [salvando, setSalvando] = useState(false);        // desabilita o botão enquanto salva
  const [erro, setErro] = useState('');                   // mensagem de erro geral

  // Estado do formulário — campos do aluno
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    idade: '',
    curso_id: ''  // chave estrangeira — referencia o ID de um curso
  });
  const [errosForm, setErrosForm] = useState({}); // erros de validação por campo

  // === CARREGAMENTO INICIAL ===
  // useEffect com [] executa UMA vez quando o componente monta
  useEffect(() => {
    carregarDados();
  }, []);

  // Busca alunos e cursos em paralelo usando Promise.all (mais rápido que sequencial)
  async function carregarDados() {
    setCarregando(true);
    const [resAlunos, resCursos] = await Promise.all([
      buscarTodos('alunos'),
      buscarTodos('cursos')
    ]);
    if (resAlunos.sucesso) setAlunos(resAlunos.dados);
    if (resCursos.sucesso) setCursos(resCursos.dados);
    if (!resAlunos.sucesso) setErro(resAlunos.mensagem);
    setCarregando(false);
  }

  // Resolve o nome do curso a partir do curso_id (chave estrangeira)
  // Usa find() para buscar no array de cursos
  function getNomeCurso(cursoId) {
    const curso = cursos.find((c) => c.id === cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  }

  // === VALIDAÇÃO DO FORMULÁRIO ===
  // Retorna objeto com erros por campo; se vazio = formulário válido
  function validar() {
    const erros = {};
    if (!formulario.nome.trim() || formulario.nome.trim().length < 3) {
      erros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!formulario.email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // valida formato email
      if (!regexEmail.test(formulario.email)) erros.email = 'Formato de e-mail inválido';
    }
    const idade = parseInt(formulario.idade);
    if (!formulario.idade || idade < 16 || idade > 100) {
      erros.idade = 'Idade deve ser entre 16 e 100';
    }
    if (!formulario.curso_id) {
      erros.curso_id = 'Selecione um curso';
    }
    return erros;
  }

  // === CREATE / UPDATE — Salvar aluno ===
  // Mesmo formulário serve para criar e editar
  // Se 'editando' tem valor → UPDATE; senão → CREATE
  async function aoSalvar(e) {
    e.preventDefault(); // impede reload da página ao submeter o form
    const errosValidacao = validar();
    setErrosForm(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return; // tem erro? para aqui

    setSalvando(true);
    const dados = {
      nome: formulario.nome.trim(),
      email: formulario.email.trim().toLowerCase(), // normaliza email
      idade: parseInt(formulario.idade),
      curso_id: formulario.curso_id
    };

    let resultado;
    if (editando) {
      // UPDATE — atualiza o documento existente no Firestore
      resultado = await atualizarDocumento('alunos', editando.id, dados);
    } else {
      // CREATE — cria novo documento no Firestore
      resultado = await criarDocumento('alunos', dados);
    }

    if (resultado.sucesso) {
      fecharFormulario();
      await carregarDados(); // recarrega a lista atualizada
    } else {
      setErro(resultado.mensagem);
    }
    setSalvando(false);
  }

  // === DELETE — Excluir aluno ===
  // Chamado ao confirmar no modal de exclusão
  async function aoExcluir() {
    if (!excluindo) return;
    const resultado = await excluirDocumento('alunos', excluindo.id);
    if (resultado.sucesso) {
      setExcluindo(null); // fecha o modal
      await carregarDados(); // recarrega a lista
    } else {
      setErro(resultado.mensagem);
    }
  }

  // Prepara o formulário para edição — preenche com os dados do aluno selecionado
  function abrirEditar(aluno) {
    setEditando(aluno);
    setFormulario({
      nome: aluno.nome,
      email: aluno.email,
      idade: aluno.idade.toString(), // converte para string pois o input type="number" espera string
      curso_id: aluno.curso_id
    });
    setErrosForm({});
    setMostrarFormulario(true);
  }

  // Fecha o formulário e limpa todos os estados relacionados
  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario({ nome: '', email: '', idade: '', curso_id: '' });
    setErrosForm({});
  }

  // === FILTRO/BUSCA LOCAL ===
  // filter() retorna apenas os alunos cujo nome OU email contém o texto buscado
  // toLowerCase() garante busca case-insensitive (ignora maiúsculas)
  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.email.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return <div className={estilos.carregando}>Carregando alunos...</div>;
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>👨‍🎓 Alunos</h1>
        <button className={estilos.botaoNovo} onClick={() => { setMostrarFormulario(true); setEditando(null); setFormulario({ nome: '', email: '', idade: '', curso_id: '' }); }}>
          + Novo Aluno
        </button>
      </div>

      {erro && <div className={estilos.erro}>{erro} <button className={estilos.botaoFecharErro} onClick={() => setErro('')}>✕</button></div>}

      <div className={estilos.filtros}>
        <input
          type="text"
          className={estilos.campoBusca}
          placeholder="🔍 Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {alunosFiltrados.length === 0 ? (
        <div className={estilos.vazio}>
          {busca ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado. Clique em "+ Novo Aluno" para começar.'}
        </div>
      ) : (
        <TabelaDados
          colunas={[
            { chave: 'nome', titulo: 'Nome' },
            { chave: 'email', titulo: 'E-mail' },
            { chave: 'idade', titulo: 'Idade' },
            { chave: 'curso_id', titulo: 'Curso', renderizar: (aluno) => <span className={estilos.badge}>{getNomeCurso(aluno.curso_id)}</span> }
          ]}
          dados={alunosFiltrados}
          aoEditar={abrirEditar}
          aoExcluir={setExcluindo}
          mensagemVazio="Nenhum aluno encontrado."
        />
      )}

      {/* Modal Formulário */}
      {mostrarFormulario && (
        <div className={estilos.modalFundo} onClick={fecharFormulario}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={estilos.modalTitulo}>{editando ? 'Editar Aluno' : 'Novo Aluno'}</h2>
            <form onSubmit={aoSalvar}>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="nome">Nome Completo</label>
                <input
                  id="nome"
                  type="text"
                  className={`${estilos.campo} ${errosForm.nome ? estilos.campoErro : ''}`}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: João da Silva"
                />
                {errosForm.nome && <span className={estilos.msgErro}>{errosForm.nome}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className={`${estilos.campo} ${errosForm.email ? estilos.campoErro : ''}`}
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  placeholder="Ex: joao@email.com"
                />
                {errosForm.email && <span className={estilos.msgErro}>{errosForm.email}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="idade">Idade</label>
                <input
                  id="idade"
                  type="number"
                  className={`${estilos.campo} ${errosForm.idade ? estilos.campoErro : ''}`}
                  value={formulario.idade}
                  onChange={(e) => setFormulario({ ...formulario, idade: e.target.value })}
                  placeholder="Ex: 22"
                  min="16"
                  max="100"
                />
                {errosForm.idade && <span className={estilos.msgErro}>{errosForm.idade}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="curso_id">Curso</label>
                <select
                  id="curso_id"
                  className={`${estilos.campo} ${errosForm.curso_id ? estilos.campoErro : ''}`}
                  value={formulario.curso_id}
                  onChange={(e) => setFormulario({ ...formulario, curso_id: e.target.value })}
                >
                  <option value="">Selecione um curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>{curso.nome} ({curso.turno})</option>
                  ))}
                </select>
                {errosForm.curso_id && <span className={estilos.msgErro}>{errosForm.curso_id}</span>}
              </div>
              <div className={estilos.modalBotoes}>
                <button type="button" className={estilos.botaoCancelar} onClick={fecharFormulario}>Cancelar</button>
                <button type="submit" className={estilos.botaoSalvar} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {excluindo && (
        <div className={estilos.modalFundo} onClick={() => setExcluindo(null)}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={estilos.modalTitulo}>Confirmar exclusão</h2>
            <p className={estilos.modalTexto}>Deseja excluir o aluno <strong>"{excluindo.nome}"</strong>?</p>
            <div className={estilos.modalBotoes}>
              <button className={estilos.botaoCancelar} onClick={() => setExcluindo(null)}>Cancelar</button>
              <button className={estilos.botaoExcluirConfirmar} onClick={aoExcluir}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alunos;
