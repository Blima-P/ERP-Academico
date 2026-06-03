import { useState, useEffect } from 'react';
import { buscarTodos, criarDocumento, atualizarDocumento, excluirDocumento } from '../../firebase/banco';
import estilos from './Matriculas.module.css';

function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [formulario, setFormulario] = useState({
    aluno_id: '',
    curso_id: '',
    data_matricula: '',
    status: 'Ativa'
  });
  const [errosForm, setErrosForm] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

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

  function getNomeAluno(alunoId) {
    const aluno = alunos.find((a) => a.id === alunoId);
    return aluno ? aluno.nome : 'Aluno não encontrado';
  }

  function getNomeCurso(cursoId) {
    const curso = cursos.find((c) => c.id === cursoId);
    return curso ? curso.nome : 'Curso não encontrado';
  }

  function validar() {
    const erros = {};
    if (!formulario.aluno_id) erros.aluno_id = 'Selecione um aluno';
    if (!formulario.curso_id) erros.curso_id = 'Selecione um curso';
    if (!formulario.data_matricula) erros.data_matricula = 'Data é obrigatória';
    if (!formulario.status) erros.status = 'Selecione um status';

    // Verificar duplicata (mesmo aluno + mesmo curso)
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

  function getCorStatus(status) {
    switch (status) {
      case 'Ativa': return estilos.badgeAtiva;
      case 'Trancada': return estilos.badgeTrancada;
      case 'Concluída': return estilos.badgeConcluida;
      default: return '';
    }
  }

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

      {erro && <div className={estilos.erro}>{erro}</div>}

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
        <div className={estilos.tabela}>
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Curso</th>
                <th>Data Matrícula</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {matriculasFiltradas.map((matricula) => (
                <tr key={matricula.id}>
                  <td>{getNomeAluno(matricula.aluno_id)}</td>
                  <td>{getNomeCurso(matricula.curso_id)}</td>
                  <td>{matricula.data_matricula}</td>
                  <td><span className={`${estilos.badge} ${getCorStatus(matricula.status)}`}>{matricula.status}</span></td>
                  <td>
                    <div className={estilos.acoes}>
                      <button className={estilos.botaoEditar} onClick={() => abrirEditar(matricula)}>✏️</button>
                      <button className={estilos.botaoExcluir} onClick={() => setExcluindo(matricula)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulário */}
      {mostrarFormulario && (
        <div className={estilos.modalFundo} onClick={fecharFormulario}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={estilos.modalTitulo}>{editando ? 'Editar Matrícula' : 'Nova Matrícula'}</h2>
            <form onSubmit={aoSalvar}>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo}>Aluno</label>
                <select
                  className={`${estilos.campo} ${errosForm.aluno_id ? estilos.campoErro : ''}`}
                  value={formulario.aluno_id}
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
                <label className={estilos.rotulo}>Curso</label>
                <input
                  type="text"
                  className={estilos.campo}
                  value={formulario.curso_id ? getNomeCurso(formulario.curso_id) : ''}
                  disabled
                  placeholder="Selecione um aluno para preencher o curso"
                />
                {errosForm.curso_id && <span className={estilos.msgErro}>{errosForm.curso_id}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo}>Data da Matrícula</label>
                <input
                  type="date"
                  className={`${estilos.campo} ${errosForm.data_matricula ? estilos.campoErro : ''}`}
                  value={formulario.data_matricula}
                  onChange={(e) => setFormulario({ ...formulario, data_matricula: e.target.value })}
                />
                {errosForm.data_matricula && <span className={estilos.msgErro}>{errosForm.data_matricula}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo}>Status</label>
                <select
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
