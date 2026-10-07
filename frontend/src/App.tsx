import { Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ConfigProvider } from './components/ConfigContext';
import { RolarAoTopo } from './components/RolarAoTopo';
import EquipeLayout from './layouts/EquipeLayout';
import PublicoLayout from './layouts/PublicoLayout';
import Configuracoes from './pages/equipe/Configuracoes';
import ConteudoAdmin from './pages/equipe/Conteudo';
import DuvidasAdmin from './pages/equipe/Duvidas';
import EventosAdmin from './pages/equipe/Eventos';
import Login from './pages/equipe/Login';
import Modulos from './pages/equipe/Modulos';
import Monitor from './pages/equipe/Monitor';
import NfseAdmin from './pages/equipe/Nfse';
import Painel from './pages/equipe/Painel';
import PrazosAdmin from './pages/equipe/Prazos';
import ServicosAdmin from './pages/equipe/ServicosAdmin';
import Usuarios from './pages/equipe/Usuarios';
import NfseAcesso from './pages/nfse/NfseAcesso';
import NfseDepois from './pages/nfse/NfseDepois';
import NfseEmitir from './pages/nfse/NfseEmitir';
import NfseGuia from './pages/nfse/NfseGuia';
import NfseInicio from './pages/nfse/NfseInicio';
import NfseMateriais from './pages/nfse/NfseMateriais';
import NfseProblemas from './pages/nfse/NfseProblemas';
import Cronograma from './pages/publico/Cronograma';
import Entenda from './pages/publico/Entenda';
import Evento from './pages/publico/Evento';
import Guia from './pages/publico/Guia';
import Inicio from './pages/publico/Inicio';
import Noticias from './pages/publico/Noticias';
import Perguntas from './pages/publico/Perguntas';
import Servicos from './pages/publico/Servicos';
import Videos from './pages/publico/Videos';
import Privacidade from './pages/publico/Privacidade';

function NaoEncontrada() {
  return (
    <div className="bloco">
      <h3>Página não encontrada</h3>
      <p className="sub" style={{ margin: 0 }}>
        O endereço pode ter mudado.{' '}
        <Link to="/" style={{ color: 'var(--laranja)', fontWeight: 600 }}>
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <RolarAoTopo />
        <Routes>
          <Route element={<PublicoLayout />}>
            <Route index element={<Inicio />} />
            <Route path="reforma/entenda" element={<Entenda />} />
            <Route path="reforma/cronograma" element={<Cronograma />} />
            <Route path="reforma/noticias" element={<Noticias />} />
            <Route path="reforma/guias/:slug" element={<Guia />} />
            <Route path="reforma/perguntas" element={<Perguntas />} />
            <Route path="reforma/videos" element={<Videos />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="eventos/:slug" element={<Evento />} />
            <Route path="privacidade" element={<Privacidade />} />
            <Route path="nfse" element={<NfseInicio />} />
            <Route path="nfse/primeiro-acesso" element={<NfseAcesso />} />
            <Route path="nfse/emitir" element={<NfseEmitir />} />
            <Route path="nfse/guia-ilustrado" element={<NfseGuia />} />
            <Route path="nfse/depois-de-emitir" element={<NfseDepois />} />
            <Route path="nfse/problemas" element={<NfseProblemas />} />
            <Route path="nfse/materiais" element={<NfseMateriais />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
          <Route path="equipe/login" element={<Login />} />
          <Route path="equipe" element={<EquipeLayout />}>
            <Route index element={<Painel />} />
            <Route path="monitor" element={<Monitor />} />
            <Route path="duvidas" element={<DuvidasAdmin />} />
            <Route path="eventos" element={<EventosAdmin />} />
            <Route path="conteudo" element={<ConteudoAdmin />} />
            <Route path="prazos" element={<PrazosAdmin />} />
            <Route path="nfse" element={<NfseAdmin />} />
            <Route path="servicos" element={<ServicosAdmin />} />
            <Route path="modulos" element={<Modulos />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}
