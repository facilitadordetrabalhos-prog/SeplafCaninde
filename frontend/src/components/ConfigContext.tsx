import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type ConfigPublica } from '../api';
import { CONFIG_PADRAO } from '../conteudo/configPadrao';

interface Ctx {
  config: ConfigPublica;
  carregada: boolean;
  falhou: boolean;
  moduloAtivo: (chave: string) => boolean;
}

const ConfigCtx = createContext<Ctx>({
  config: CONFIG_PADRAO,
  carregada: false,
  falhou: false,
  moduloAtivo: () => true,
});

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigPublica>(CONFIG_PADRAO);
  const [carregada, setCarregada] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let vivo = true;
    api
      .configPublica()
      .then((c) => {
        if (!vivo || !c) return;
        setConfig({
          contatos: { ...CONFIG_PADRAO.contatos, ...(c.contatos ?? {}) },
          nfse: { ...CONFIG_PADRAO.nfse, ...(c.nfse ?? {}) },
          emailAtivo: c.emailAtivo === true,
          modulos: Array.isArray(c.modulos) ? c.modulos : [],
        });
      })
      .catch(() => vivo && setFalhou(true))
      .finally(() => vivo && setCarregada(true));
    return () => {
      vivo = false;
    };
  }, []);

  const moduloAtivo = (chave: string) => {
    const m = config.modulos.find((x) => x.chave === chave);
    return m ? m.ativo : true;
  };

  return <ConfigCtx.Provider value={{ config, carregada, falhou, moduloAtivo }}>{children}</ConfigCtx.Provider>;
}

export function useConfig() {
  return useContext(ConfigCtx);
}
