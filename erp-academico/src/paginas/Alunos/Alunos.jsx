import { useState, useEffect } from 'react';
import { buscarTodos, criarDocumento, atualizarDocumento, excluirDocumento } from '../../firebase/banco';
import TabelaDados from '../../componentes/TabelaDados/TabelaDados';
import estilos from './Alunos.module.css';

function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    idade: '',
    curso_id: ''
  });
  const [errosForm, setErrosForm] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

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

  function getNomeCurso(cursoId) {
    const curso = cursos.find((c) => c.id === cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  }

  function validar() {
    const erros = {};
    if (!formulario.nome.trim() || formulario.nome.trim().length < 3) {
      erros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!formulario.email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  async function aoSalvar(e) {
    e.preventDefault();
    const errosValidacao = validar();
    setErrosForm(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return;

    setSalvando(true);
    const dados = {
      nome: formulario.nome.trim(),
      email: formulario.email.trim().toLowerCase(),
      idade: parseInt(formulario.idade),
      curso_id: formulario.curso_id
    };

    let resultado;
    if (editando) {
      resultado = await atualizarDocumento('alunos', editando.id, dados);
    } else {
      resultado = await criarDocumento('alunos', dados);
    }

    if (resultado.sucesso) {
      fecharFormulario();
      await carregarDados();
    } else {
      setErro(resultado.mensagem);
    }
    setSalvando(false);
  }

  async function aoExcluir() {
    if (!excluindo) return;
    const resultado = await excluirDocumento('alunos', excluindo.id);
    if (resultado.sucesso) {
      setExcluindo(null);
      await carregarDados();
    } else {
      setErro(resultado.mensagem);
    }
  }

  function abrirEditar(aluno) {
    setEditando(aluno);
    setFormulario({
      nome: aluno.nome,
      email: aluno.email,
      idade: aluno.idade.toString(),
      curso_id: aluno.curso_id
    });
    setErrosForm({});
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario({ nome: '', email: '', idade: '', curso_id: '' });
    setErrosForm({});
  }

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