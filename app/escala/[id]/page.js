"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import MembersEditor from "@/components/escala/MembersEditor";

export default function EscalaPage() {
  const params = useParams();
  const pathname = usePathname();
  const idEscala = params?.id || (pathname ? pathname.split('/').pop() : null);

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  
  const [sorteadoTemporario, setSorteadoTemporario] = useState(null);
  const [isPendente, setIsPendente] = useState(false);
  const [ignorados, setIgnorados] = useState([]);

  // Estados do Modal de Edição de Membros
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [membrosEditaveis, setMembrosEditaveis] = useState([]);

  useEffect(() => {
    if (!idEscala) return;

    const carregarDados = async () => {
      try {
        const res = await fetch(`/api/escala/${idEscala}`);
        const json = await res.json();
        
        if (res.ok) {
          setDados(json);
          // Junta todos os membros (da fila, ok e pendentes) para preencher o editor inicialmente
          const todosMembros = [...json.fila, ...json.ok, ...(json.pendentes || [])];
          setMembrosEditaveis(todosMembros);
        } else {
          setMensagem(json.error || "Escala não encontrada no banco de dados.");
        }
      } catch (error) {
        setMensagem("Erro de conexão. Verifique o terminal do servidor.");
      }
    };
    
    carregarDados();
  }, [idEscala]);

  const realizarSorteio = async (listaIgnorados = ignorados) => {
    setLoading(true);
    setMensagem("");
    setSorteadoTemporario(null);
    setIsPendente(false);

    try {
      const res = await fetch(`/api/escala/${idEscala}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "sortear", ignorados: listaIgnorados })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        setMensagem(json.error || "Erro ao sortear.");
      } else {
        setSorteadoTemporario(json.pessoa);
        setIsPendente(json.viaPendentes);
      }
    } catch (error) {
      setMensagem("Erro na comunicação com o servidor.");
    }
    setLoading(false);
  };

  const confirmarSorteio = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/escala/${idEscala}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "confirmar", pessoaConfirmada: sorteadoTemporario, ignorados: ignorados })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        setMensagem(json.error || "Erro ao confirmar.");
      } else {
        setMensagem("✅ Sorteio consolidado com sucesso!");
        setDados(json.data);
        setSorteadoTemporario(null);
        setIgnorados([]); 
      }
    } catch (error) {
      setMensagem("Erro na comunicação.");
    }
    setLoading(false);
  };

  const marcarAusenteERefazer = () => {
    const novosIgnorados = [...ignorados, sorteadoTemporario];
    setIgnorados(novosIgnorados);
    realizarSorteio(novosIgnorados);
  };

  // Nova função para salvar a edição dos membros
  const salvarEdicaoMembros = async () => {
    if (membrosEditaveis.length < 2) {
        setMensagem("Erro: A escala precisa ter pelo menos 2 membros.");
        setIsEditingMembers(false);
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(`/api/escala/${idEscala}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acao: "editar_membros", novosMembros: membrosEditaveis })
        });

        const json = await res.json();

        if (res.ok) {
            setDados(json.data);
            setIsEditingMembers(false);
            setMensagem("👥 Membros atualizados com sucesso!");
            setTimeout(() => setMensagem(""), 4000); // Limpa o aviso depois de 4s
        } else {
            setMensagem(json.error || "Erro ao atualizar membros.");
            setIsEditingMembers(false);
        }
    } catch (error) {
        setMensagem("Erro na comunicação com o servidor.");
        setIsEditingMembers(false);
    }
    setLoading(false);
  };

  if (!dados && !mensagem) return <div className="flex h-full items-center justify-center text-indigo-500 font-medium">Carregando dados da escala...</div>;
  if (!dados && mensagem) return <div className="flex h-full items-center justify-center text-red-500 font-medium">{mensagem}</div>;

  return (
    <div className="flex flex-col items-center py-10 px-4 font-sans text-gray-800 w-full h-full overflow-y-auto relative">
      
      {/* MODAL DE EDIÇÃO DE MEMBROS */}
      {isEditingMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">Gerenciar Participantes</h2>
                    <button onClick={() => setIsEditingMembers(false)} className="text-gray-400 hover:text-red-500">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto">
                    {/* AQUI ESTÁ O SEU COMPONENTE REUTILIZÁVEL */}
                    <MembersEditor membros={membrosEditaveis} setMembros={setMembrosEditaveis} />
                </div>
                
                <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                    <button 
                        onClick={() => setIsEditingMembers(false)}
                        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={salvarEdicaoMembros}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* TELA PRINCIPAL */}
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden p-6 border border-gray-100 mt-8 md:mt-0">
        
        <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-indigo-600 flex-1 text-center pl-8">
            {dados.nome}
            </h1>
            <button 
                onClick={() => setIsEditingMembers(true)} 
                className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                title="Editar Membros"
            >
                <SettingsIcon />
            </button>
        </div>

        <div className={`relative rounded-xl p-6 text-center mb-6 transition-all ${sorteadoTemporario ? 'bg-amber-100 border-2 border-amber-400 border-dashed' : 'bg-indigo-50 border border-indigo-100'}`}>
          {sorteadoTemporario && isPendente && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase">
              Pagando Dívida
            </span>
          )}

          <p className={`text-md font-semibold uppercase tracking-wider mb-2 ${sorteadoTemporario ? 'text-amber-600' : 'text-indigo-600'}`}>
            {sorteadoTemporario ? "Aguardando Confirmação..." : "Parabéns"}
          </p>
          
          <p className={`text-4xl font-extrabold ${sorteadoTemporario ? 'text-amber-700 animate-pulse' : 'text-indigo-700'}`}>
            {sorteadoTemporario || dados.sorteado || "Nenhum"}
          </p>
          
          {!sorteadoTemporario && dados.ultimaExecucao && (
            <p className="text-xs text-gray-500 mt-3">
              Sorteado no dia: {dados.ultimaExecucao}
            </p>
          )}
        </div>

        {mensagem && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${mensagem.includes("Erro") || mensagem.includes("já foi") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {mensagem}
          </div>
        )}

        {!sorteadoTemporario ? (
          <button
            onClick={() => realizarSorteio()}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Calculando..." : "Realizar Sorteio"}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button onClick={confirmarSorteio} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
              ✅ Confirmar Presença
            </button>
            <button onClick={marcarAusenteERefazer} disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
              ❌ Ausente (Refazer Sorteio)
            </button>
          </div>
        )}

        <hr className="my-8 border-gray-200" />

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex flex-col gap-1">
            Status da Fila
            <div className="flex gap-2">
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Restantes: {dados.fila.length}
              </span>
              {dados.pendentes && dados.pendentes.length > 0 && (
                <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                  Devendo: {dados.pendentes.join(", ")}
                </span>
              )}
            </div>
          </h2>
          
          <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {dados.historico && dados.historico.length > 0 ? (
              dados.historico.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-700">{item.nome}</span>
                  <span className="text-xs text-gray-500">{item.data}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center">Nenhum histórico disponível.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}