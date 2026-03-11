"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MembersEditor from "@/components/escala/MembersEditor";

export default function NovaEscalaPage() {
  const router = useRouter();
  const [nomeEscala, setNomeEscala] = useState("");
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const salvarEscala = async () => {
    if (!nomeEscala.trim()) return setErro("Dê um nome para a escala.");
    if (membros.length < 2) return setErro("Adicione pelo menos 2 membros.");

    setLoading(true);
    try {
      const res = await fetch("/api/escala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeEscala, membros })
      });
      const json = await res.json();
      
      if (res.ok) {
        // Redireciona para a tela da escala recém-criada
        router.push(`/escala/${json.id}`); 
        // Atualiza a página para o submenu pegar a nova escala (temporário até usarmos contexto)
        setTimeout(() => window.location.reload(), 500);
      } else {
        setErro(json.error);
      }
    } catch (e) {
      setErro("Erro de conexão.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 w-full">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Criar Nova Escala</h1>
        
        {erro && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">{erro}</div>}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Escala</label>
          <input
            type="text"
            value={nomeEscala}
            onChange={(e) => setNomeEscala(e.target.value)}
            placeholder="Ex: Limpeza da Copa"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Aqui o Componente Reutilizável entra em ação! */}
        <MembersEditor membros={membros} setMembros={setMembros} />

        <button
          onClick={salvarEscala}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 mt-6 rounded-xl transition-all shadow-md disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar Escala"}
        </button>
      </div>
    </div>
  );
}