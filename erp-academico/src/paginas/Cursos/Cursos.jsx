import { useState, useEffect } from 'react';
import { buscarTodos, criarDocumento, atualizarDocumento, excluirDocumento } from '../../firebase/banco';
import TabelaDados from '../../componentes/TabelaDados/TabelaDados';
import estilos from './Cursos.module.css';

function Cursos() {
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
    carga_horaria: '',
    turno: ''
  });
  const [errosForm, setErrosForm] = useState({});

  useEffect(() => {
    carregarCursos();
  }, []);

  async function carregarCursos() {
    setCarregando(true);
    const resultado = await buscarTodos('cursos');
    if (resultado.sucesso) {
      setCursos(resultado.dados);
    } else {
      setErro(resultado.mensagem);
    }
    setCarregando(false);
  }

  function validar() {
    const erros = {};
    if (!formulario.nome.trim() || formulario.nome.trim().length < 3) {
      erros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!formulario.carga_horaria || parseInt(formulario.carga_horaria) < 20) {
      erros.carga_horaria = 'Carga horária mínima: 20 horas';
    }
    if (!formulario.turno) {
      erros.turno = 'Selecione um turno';
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
      carga_horaria: parseInt(formulario.carga_horaria),
      turno: formulario.turno
    };

    let resultado;
    if (editando) {
      resultado = await atualizarDocumento('cursos', editando.id, dados);
    } else {
      resultado = await criarDocumento('cursos', dados);
    }

    if (resultado.sucesso) {
      fecharFormulario();
      await carregarCursos();
    } else {
      setErro(resultado.mensagem);
    }
    setSalvando(false);
  }

  async function aoExcluir() {
    if (!excluindo) return;
    const resultado = await excluirDocumento('cursos', excluindo.id);
    if (resultado.sucesso) {
      setExcluindo(null);
      await carregarCursos();
    } else {
      setErro(resultado.mensagem);
    }
  }

  function abrirEditar(curso) {
    setEditando(curso);
    setFormulario({
      nome: curso.nome,
      carga_horaria: curso.carga_horaria.toString(),
      turno: curso.turno
    });
    setErrosForm({});
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario({ nome: '', carga_horaria: '', turno: '' });
    setErrosForm({});
  }

  const cursosFiltrados = cursos.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return <div className={estilos.carregando}>Carregando cursos...</div>;
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>📚 Cursos</h1>
        <button className={estilos.botaoNovo} onClick={() => { setMostrarFormulario(true); setEditando(null); setFormulario({ nome: '', carga_horaria: '', turno: '' }); }}>
          + Novo Curso
        </button>
      </div>

      {erro && <div className={estilos.erro}>{erro} <button className={estilos.botaoFecharErro} onClick={() => setErro('')}>✕</button></div>}

      <div className={estilos.filtros}>
        <input
          type="text"
          className={estilos.campoBusca}
          placeholder="🔍 Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {cursosFiltrados.length === 0 ? (
        <div className={estilos.vazio}>
          {busca ? 'Nenhum curso encontrado para essa busca.' : 'Nenhum curso cadastrado. Clique em "+ Novo Curso" para começar.'}
        </div>
      ) : (
        <TabelaDados
          colunas={[
            { chave: 'nome', titulo: 'Nome' },
            { chave: 'carga_horaria', titulo: 'Carga Horária', renderizar: (curso) => `${curso.carga_horaria}h` },
            { chave: 'turno', titulo: 'Turno', renderizar: (curso) => <span className={estilos.badge}>{curso.turno}</span> }
          ]}
          dados={cursosFiltrados}
          aoEditar={abrirEditar}
          aoExcluir={setExcluindo}
          mensagemVazio="Nenhum curso encontrado."
        />
      )}

      {/* Modal Formulário */}
      {mostrarFormulario && (
        <div className={estilos.modalFundo} onClick={fecharFormulario}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={estilos.modalTitulo}>{editando ? 'Editar Curso' : 'Novo Curso'}</h2>
            <form onSubmit={aoSalvar}>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="nome">Nome do Curso</label>
                <input
                  id="nome"
                  type="text"
                  className={`${estilos.campo} ${errosForm.nome ? estilos.campoErro : ''}`}
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  placeholder="Ex: Engenharia de Software"
                />
                {errosForm.nome && <span className={estilos.msgErro}>{errosForm.nome}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="carga_horaria">Carga Horária (horas)</label>
                <input
                  id="carga_horaria"
                  type="number"
                  className={`${estilos.campo} ${errosForm.carga_horaria ? estilos.campoErro : ''}`}
                  value={formulario.carga_horaria}
                  onChange={(e) => setFormulario({ ...formulario, carga_horaria: e.target.value })}
                  placeholder="Ex: 3200"
                  min="20"
                />
                {errosForm.carga_horaria && <span className={estilos.msgErro}>{errosForm.carga_horaria}</span>}
              </div>
              <div className={estilos.grupoCampo}>
                <label className={estilos.rotulo} htmlFor="turno">Turno</label>
                <select
                  id="turno"
                  className={`${estilos.campo} ${errosForm.turno ? estilos.campoErro : ''}`}
                  value={formulario.turno}
                  onChange={(e) => setFormulario({ ...formulario, turno: e.target.value })}
                >
                  <option value="">Selecione o turno</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
                {errosForm.turno && <span className={estilos.msgErro}>{errosForm.turno}</span>}
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
            <p className={estilos.modalTexto}>Deseja excluir o curso <strong>"{excluindo.nome}"</strong>?</p>
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

export default Cursos;
