// App.js — Componente raiz que define todas as rotas da aplicação
// Usa React Router para navegação e RotaPrivada para proteger páginas
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao';
import RotaPrivada from './componentes/RotaPrivada/RotaPrivada';
import Layout from './componentes/Layout/Layout';
import Login from './paginas/Login/Login';
import PainelInicial from './paginas/PainelInicial/PainelInicial';
import Cursos from './paginas/Cursos/Cursos';
import Alunos from './paginas/Alunos/Alunos';
import Matriculas from './paginas/Matriculas/Matriculas';
import Relatorio from './paginas/Relatorio/Relatorio';

function App() {
  return (
    // ProvedorAutenticacao envolve tudo para que qualquer componente acesse o estado de login
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          {/* Rota pública — qualquer um pode acessar */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas — só acessíveis se estiver logado */}
          <Route
            path="/"
            element={
              <RotaPrivada>
                <Layout />
              </RotaPrivada>
            }
          >
            {/* Rotas filhas renderizadas dentro do Layout via <Outlet /> */}
            <Route index element={<PainelInicial />} />
            <Route path="alunos" element={<Alunos />} />
            <Route path="cursos" element={<Cursos />} />
            <Route path="matriculas" element={<Matriculas />} />
            <Route path="relatorio" element={<Relatorio />} />
          </Route>

          {/* Qualquer rota desconhecida redireciona para a página inicial */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}

export default App;
