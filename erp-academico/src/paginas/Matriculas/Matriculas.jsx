// Matrículas — Página de CRUD que relaciona Alunos e Cursos
// O curso é preenchido automaticamente ao selecionar o aluno (vem do cadastro)
// Possui Create, Read (com TabelaDados reutilizável), Update e Delete
import { useState, useEffect } from 'react';
import { buscarTodos, criarDocumento, atualizarDocumento, excluirDocumento } from '../../firebase/banco';
import TabelaDados from '../../componentes/TabelaDados/TabelaDados';
import estilos from './Matriculas.module.css';

function Matriculas() {
  // === ESTADOS (useState) ===
  const [matriculas, setMatriculas] = useState([]);       // lista de matrículas
  const [alunos, setAlunos] = useState([]);               // lista de alunos (para o select e resolução de nomes)
  const [cursos, setCursos] = useState([]);               // lista de cursos (para resolução de nomes)
  const [carregando, setCarregando] = useState(true);     // loading da página
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // modal do form
  const [editando, setEditando] = useState(null);         // UPDATE se tem valor, CREATE se null
  const [excluindo, setExcluindo] = useState(null);       // matrícula a ser excluída
  const [filtroStatus, setFiltroStatus] = useState('');   // filtro por status (Ativa/Trancada/Concluída)
  const [salvando, setSalvando] = useState(false);        // controle do botão salvar
  const [erro, setErro] = useState('');                   // mensagem de erro

  // Estado do formulário — campos da matrícula
  const [formulario, setFormulario] = useState({
    aluno_id: '',        // chave estrangeira → Alunos
    curso_id: '',        // chave estrangeira → Cursos (preenchido automaticamente)
    data_matricula: '',
    status: 'Ativa'      // valor padrão
  });
  const [errosForm, setErrosForm] = useState({});

  // === CARREGAMENTO INICIAL ===
  useEffect(() => {
    carregarDados();
  }, []);

  // Busca as 3 coleções em paralelo (Promise.all)
  async function carregarDados() {
    setCarregando(true);
    const [resMatriculas, resAlunos, resCursos] = await Promise.all([
      buscarTodos('matriculas'),
      buscarTodos('alunos'),
      buscarTodos('cursos')
    ]);
    if (resMatriculas.sucesso) setMatriculas(resMatriculas.dados);
    if (resAlunos.sucesso) setAlunos(resAlunos.dados);
    if (resCursos.sucesso) setCursos(resCursos.dados);
    if (!resMatriculas.sucesso) setErro(resMatriculas.mensagem);
    setCarregando(false);
  }

  // Resolve nome do aluno a partir do ID (chave estrangeira)
  function getNomeAluno(alunoId) {
    const aluno = alunos.find((a) => a.id === alunoId);
    return aluno ? aluno.nome : 'Aluno não encontrado';
  }

  // Resolve nome do curso a partir do ID (chave estrangeira)
  function getNomeCurso(cursoId) {
    const curso = cursos.find((c) => c.id === cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  }

  // === VALIDAÇÃO ===
  function validar() {
    const erros = {};
    if (!formulario.aluno_id) erros.aluno_id = 'Selecione um aluno';
    if (!formulario.curso_id) erros.curso_id = 'Selecione um curso';
    if (!formulario.data_matricula) erros.data_matricula = 'Data é obrigatória';
    if (!formulario.status) erros.status = 'Selecione um status';

    // Validação de duplicata — impede matricular o mesmo aluno no mesmo curso 2x
    // Usa find() para verificar se já existe uma matrícula com mesmo aluno_id + curso_id
    if (formulario.aluno_id && formulario.curso_id) {
      const duplicata = matriculas.find(
        (m) => m.aluno_id === formulario.aluno_id && m.curso_id === formulario.curso_id && (!editando || m.id !== editando.id)
      );
      if (duplicata) {
        erros.aluno_id = 'Este aluno já está matriculado neste curso';
      }
    }
    return erros;
  }

  // === CREATE / UPDATE ===
  async function aoSalvar(e) {
    e.preventDefault();
    const errosValidacao = validar();
    setErrosForm(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return;

    setSalvando(true);
    const dados = {
      aluno_id: formulario.aluno_id,
      curso_id: formulario.curso_id,
      data_matricula: formulario.data_matricula,
      status: formulario.status
    };

    let resultado;
    if (editando) {
      resultado = await atualizarDocumento('matriculas', editando.id, dados);
    } else {
      resultado = await criarDocumento('matriculas', dados);
    }

    if (resultado.sucesso) {
      fecharFormulario();
      await carregarDados();
    } else {
      setErro(resultado.mensagem);
    }
    setSalvando(false);
  }

  // === DELETE ===
  async function aoExcluir() {
    if (!excluindo) return;
    const resultado = await excluirDocumento('matriculas', excluindo.id);
    if (resultado.sucesso) {
      setExcluindo(null);
      await carregarDados();
    } else {
      setErro(resultado.mensagem);
    }
  }

  // Prepara formulário para edição
  // Busca o curso_id do aluno para preencher automaticamente
  function abrirEditar(matricula) {
    setEditando(matricula);
    const aluno = alunos.find((a) => a.id === matricula.aluno_id);
    setFormulario({
      aluno_id: matricula.aluno_id,
      curso_id: aluno ? aluno.curso_id : matricula.curso_id,
      data_matricula: matricula.data_matricula,
      status: matricula.status
    });
    setErrosForm({});
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario({ aluno_id: '', curso_id: '', data_matricula: '', status: 'Ativa' });
    setErrosForm({});
  }

  // Retorna a classe CSS correspondente ao status (cores diferentes)
  function getCorStatus(status) {
    switch (status) {
      case 'Ativa': return estilos.badgeAtiva;
      case 'Trancada': return estilos.badgeTrancada;
      case 'Concluída': return estilos.badgeConcluida;
      default: return '';
    }
  }

  // === FILTRO POR STATUS ===
  // Se filtroStatus está vazio, mostra todas; senão filtra pelo status selecionado
  const matriculasFiltradas = filtroStatus
    ? matriculas.filter((m) => m.status === filtroStatus)
    : matriculas;

  if (carregando) {
    return <div className={estilos.carregando}>Carregando matrículas...</div>;
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>📋 Matrículas</h1>
        <button className={estilos.botaoNovo} onClick={() => { setMostrarFormulario(true); setEditando(null); setFormulario({ aluno_id: '', curso_id: '', data_matricula: '', status: 'Ativa' }); }}>
          + Nova Matrícula
        </button>
      </div>

      {erro && <div className={estilos.erro}>{erro} <button className={estilos.botaoFecharErro} onClick={() => setErro('')}>✕</button></div>}

      <div className={estilos.filtros}>
        <select
          className={estilos.campoFiltro}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="Ativa">Ativa</option>
          <option value="Trancada">Trancada</option>
          <option value="Concluída">Concluída</option>
        </select>
      </div>

      {matriculasFiltradas.length === 0 ? (
        <div className={estilos.vazio}>
          {filtroStatus ? 'Nenhuma matrícula com esse status.' : 'Nenhuma matrícula cadastrada. Clique em "+ Nova Matrícula" para começar.'}
        </div>
      ) : (
        <TabelaDados
          colunas={[
            { chave: 'aluno_id', titulo: 'Aluno', renderizar: (m) => getNomeAluno(m.aluno_id) },
            { chave: 'curso_id', titulo: 'Curso', renderizar: (m) => getNomeCurso(m.curso_id) },
            { chave: 'data_matricula', titulo: 'Data Matrícula' },
            { chave: 'status', titulo: 'Status', renderizar: (m) => <span className={`${estilos.badge} ${getCorStatus(m.status)}`}>{m.status}</span> }
          ]}
          dados={matriculasFiltradas}
          aoEditar={abrirEditar}
          aoExcluir={setExcluindo}
          mensagemVazio="Nenhuma matrícula encontrada."
        />
      )}

      {/* Modal Formulário */}
      {mostrarFormulario && (
        <div className={estilos.modalFundo} onClick={fecharFormulario}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={estilos.modalTitulo}>{editando ? 'Editar Matrícula' : 'Nova Matrícula'}</h2>
            <form onSubmit={aoSalvar}>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="aluno_id">Aluno</label>
                <select
                  id="aluno_id"
                  className={`${estilos.campo} ${errosForm.aluno_id ? estilos.campoErro : ''}`}
                  value={formulario.aluno_id}
                  disabled={!!editando}
                  onChange={(e) => {
                    const alunoSelecionado = alunos.find((a) => a.id === e.target.value);
                    setFormulario({
                      ...formulario,
                      aluno_id: e.target.value,
                      curso_id: alunoSelecionado ? alunoSelecionado.curso_id : ''
                    });
                  }}
                >
                  <option value="">Selecione um aluno</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                  ))}
                </select>
                {errosForm.aluno_id && <span className={estilos.msgErro}>{errosForm.aluno_id}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="curso_id">Curso</label>
                <input
                  id="curso_id"
                  type="text"
                  className={estilos.campo}
                  value={formulario.curso_id ? getNomeCurso(formulario.curso_id) : ''}
                  disabled
                  placeholder="Selecione um aluno para preencher o curso"
                />
                {errosForm.curso_id && <span className={estilos.msgErro}>{errosForm.curso_id}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="data_matricula">Data da Matrícula</label>
                <input
                  id="data_matricula"
                  type="date"
                  className={`${estilos.campo} ${errosForm.data_matricula ? estilos.campoErro : ''}`}
                  value={formulario.data_matricula}
                  onChange={(e) => setFormulario({ ...formulario, data_matricula: e.target.value })}
                />
                {errosForm.data_matricula && <span className={estilos.msgErro}>{errosForm.data_matricula}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="status">Status</label>
                <select
                  id="status"
                  className={`${estilos.campo} ${errosForm.status ? estilos.campoErro : ''}`}
                  value={formulario.status}
                  onChange={(e) => setFormulario({ ...formulario, status: e.target.value })}
                >
                  <option value="Ativa">Ativa</option>
                  <option value="Trancada">Trancada</option>
                  <option value="Concluída">Concluída</option>
                </select>
                {errosForm.status && <span className={estilos.msgErro}>{errosForm.status}</span>}
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
            <p className={estilos.modalTexto}>Deseja excluir esta matrícula?</p>
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

export default Matriculas;
