"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // Carrega os dados iniciais ao abrir a página
  const carregarDados = async () => {
    try {
      const res = await fetch("/api/sorteio");
      const json = await res.json();
      setDados(json);
    } catch (error) {
      console.error("Erro ao carregar os dados", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const realizarSorteio = async () => {
    setLoading(true);
    setMensagem("");
    try {
      const res = await fetch("/api/sorteio", { method: "POST" });
      const json = await res.json();
      
      if (!res.ok) {
        setMensagem(json.error || "Erro ao sortear.");
      } else {
        setMensagem("🎉 Sorteio realizado com sucesso!");
        setDados(json.data); // Atualiza a tela com o novo sorteado
      }
    } catch (error) {
      setMensagem("Erro na comunicação com o servidor.");
    }
    setLoading(false);
  };

  if (!dados) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden p-6 border border-gray-100">
        
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Sorteio Diário
        </h1>

        {/* Card do Sorteado Atual */}
        <div className="bg-indigo-50 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-indigo-400 font-semibold uppercase tracking-wider mb-2">
            Sorteado de Hoje
          </p>
          <p className="text-4xl font-extrabold text-indigo-700">
            {dados.sorteado || "Nenhum ainda"}
          </p>
          {dados.ultimaExecucao && (
            <p className="text-xs text-gray-500 mt-3">
              Última execução: {dados.ultimaExecucao}
            </p>
          )}
        </div>

        {/* Mensagens de Alerta */}
        {mensagem && (
          <div className={`p-3 rounded-lg mb-6 text-center text-sm font-medium ${mensagem.includes("Erro") || mensagem.includes("já foi") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {mensagem}
          </div>
        )}

        {/* Botão de Ação */}
        <button
          onClick={realizarSorteio}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
        >
          {loading ? "Sorteando..." : "Realizar Sorteio"}
        </button>

        <hr className="my-8 border-gray-200" />

        {/* Histórico */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center justify-between">
            Histórico Recente
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Faltam: {dados.fila.length}
            </span>
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
    </main>
  );
}