// Cursos — Página de CRUD completo para gerenciar cursos
// Possui Create (cadastro com validação), Read (listagem com TabelaDados),
// Update (edição) e Delete (exclusão com confirmação)
import { useState, useEffect } from 'react';
import { buscarTodos, criarDocumento, atualizarDocumento, excluirDocumento } from '../../firebase/banco';
import TabelaDados from '../../componentes/TabelaDados/TabelaDados';
import estilos from './Cursos.module.css';

function Cursos() {
  // === ESTADOS (useState) ===
  const [cursos, setCursos] = useState([]);               // lista de cursos do Firestore
  const [carregando, setCarregando] = useState(true);     // controla o loading da página
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // abre/fecha o modal do form
  const [editando, setEditando] = useState(null);         // se tem valor = UPDATE, se null = CREATE
  const [excluindo, setExcluindo] = useState(null);       // guarda o curso a ser excluído
  const [busca, setBusca] = useState('');                  // texto do campo de busca
  const [salvando, setSalvando] = useState(false);        // desabilita botão durante salvamento
  const [erro, setErro] = useState('');                   // mensagem de erro

  // Estado do formulário — campos do curso
  const [formulario, setFormulario] = useState({
    nome: '',
    carga_horaria: '',
    turno: ''
  });
  const [errosForm, setErrosForm] = useState({}); // erros de validação por campo

  // === CARREGAMENTO INICIAL ===
  // useEffect com [] executa UMA vez quando o componente monta
  useEffect(() => {
    carregarCursos();
  }, []);

  // Busca todos os cursos da coleção 'cursos' no Firestore
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

  // === VALIDAÇÃO DO FORMULÁRIO ===
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

  // === CREATE / UPDATE — Salvar curso ===
  async function aoSalvar(e) {
    e.preventDefault(); // impede reload da página
    const errosValidacao = validar();
    setErrosForm(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return; // se tem erro, para

    setSalvando(true);
    const dados = {
      nome: formulario.nome.trim(),
      carga_horaria: parseInt(formulario.carga_horaria), // converte string → número
      turno: formulario.turno
    };

    let resultado;
    if (editando) {
      // UPDATE — atualiza curso existente
      resultado = await atualizarDocumento('cursos', editando.id, dados);
    } else {
      // CREATE — cria novo curso
      resultado = await criarDocumento('cursos', dados);
    }

    if (resultado.sucesso) {
      fecharFormulario();
      await carregarCursos(); // recarrega a lista
    } else {
      setErro(resultado.mensagem);
    }
    setSalvando(false);
  }

  // === DELETE — Excluir curso ===
  async function aoExcluir() {
    if (!excluindo) return;
    const resultado = await excluirDocumento('cursos', excluindo.id);
    if (resultado.sucesso) {
      setExcluindo(null); // fecha modal
      await carregarCursos();
    } else {
      setErro(resultado.mensagem);
    }
  }

  // Prepara o formulário para edição — preenche com dados do curso selecionado
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

  // Fecha o formulário e limpa todos os estados
  function fecharFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario({ nome: '', carga_horaria: '', turno: '' });
    setErrosForm({});
  }

  // === FILTRO/BUSCA LOCAL ===
  // filter() retorna apenas cursos cujo nome contém o texto buscado
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
