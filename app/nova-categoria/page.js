"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaCategoriaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const salvarCategoria = async () => {
    if (!nome.trim()) return setErro("Dê um nome para a categoria.");

    setLoading(true);
    try {
      const res = await fetch("/api/anotacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome })
      });
      const json = await res.json();
      
      if (res.ok) {
        router.push(`/anotacoes/${json.id}`);
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
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Criar Categoria de Anotações</h1>
        {erro && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">{erro}</div>}
        
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Categoria</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ideias Pessoais" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />

        <button onClick={salvarCategoria} disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 mt-6 rounded-xl hover:bg-indigo-700 transition-all">
          {loading ? "Criando..." : "Criar Categoria"}
        </button>
      </div>
    </div>
  );
}