import estilos from './TabelaDados.module.css';

function TabelaDados({ colunas, dados, aoEditar, aoExcluir, mensagemVazio }) {
  if (dados.length === 0) {
    return (
      <div className={estilos.vazio}>
        {mensagemVazio || 'Nenhum registro encontrado.'}
      </div>
    );
  }

  return (
    <div className={estilos.tabela}>
      <table>
        <thead>
          <tr>
            {colunas.map((col) => (
              <th key={col.chave}>{col.titulo}</th>
            ))}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id}>
              {colunas.map((col) => (
                <td key={col.chave}>
                  {col.renderizar ? col.renderizar(item) : item[col.chave]}
                </td>
              ))}
              <td>
                <div className={estilos.acoes}>
                  <button className={estilos.botaoEditar} onClick={() => aoEditar(item)}>✏️</button>
                  <button className={estilos.botaoExcluir} onClick={() => aoExcluir(item)}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaDados;
