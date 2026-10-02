import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  api,
  ApiError,
  EVENTO_NAO_AUTORIZADO,
  guardarSessao,
  lerToken,
  lerUsuarioGuardado,
  limparSessao,
  type Perfil,
  type Usuario,
} from '../api';

interface Ctx {
  usuario: Usuario | null;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
  pode: (...perfis: Perfil[]) => boolean;
}

const AuthCtx = createContext<Ctx>({
  usuario: null,
  autenticado: false,
  entrar: async () => undefined,
  sair: () => undefined,
  pode: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => (lerToken() ? lerUsuarioGuardado() : null));
  const [autenticado, setAutenticado] = useState<boolean>(() => !!lerToken());

  // confere o token guardado assim que o app abre
  useEffect(() => {
    const token = lerToken();
    if (!token) return;
    api
      .eu()
      .then((u) => {
        setUsuario(u);
        guardarSessao(token, u);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          limparSessao();
          setUsuario(null);
          setAutenticado(false);
        }
      });
  }, []);

  useEffect(() => {
    const expirou = () => {
      setUsuario(null);
      setAutenticado(false);
    };
    window.addEventListener(EVENTO_NAO_AUTORIZADO, expirou);
    return () => window.removeEventListener(EVENTO_NAO_AUTORIZADO, expirou);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const r = await api.login(email, senha);
    guardarSessao(r.token, r.usuario);
    setUsuario(r.usuario);
    setAutenticado(true);
  }, []);

  const sair = useCallback(() => {
    limparSessao();
    setUsuario(null);
    setAutenticado(false);
  }, []);

  const pode = useCallback((...perfis: Perfil[]) => !!usuario && perfis.includes(usuario.perfil), [usuario]);

  return <AuthCtx.Provider value={{ usuario, autenticado, entrar, sair, pode }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
