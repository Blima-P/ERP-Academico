import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import estilos from './RotaPrivada.module.css';

function RotaPrivada({ children }) {
  const { estaAutenticado, carregando } = useAutenticacao();

  // Enquanto verifica localStorage, mostra tela de carregamento
  if (carregando) {
    return (
      <div className={estilos.carregandoContainer}>
        <div className={estilos.spinner}></div>
        <p className={estilos.carregandoTexto}>Verificando sessão...</p>
      </div>
    );
  }

  // Se não autenticado, redireciona para login
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza o conteúdo protegido
  return children;
}

export default RotaPrivada;
