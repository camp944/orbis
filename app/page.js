"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, CalendarClock, Target, ArrowRight, BellRing, CheckSquare, Clock } from "lucide-react";
import PrioBadge from "@/components/anotacoes/PrioBadge";

export default function OrbisViewDashboard() {
  const [dados, setDados] = useState({ 
    escalas: [], 
    lembretesHoje: {}, 
    notasCriticas: [], 
    loading: true 
  });

  // Calcula a data local real do Brasil (Evita bug de UTC)
  const hoje = new Date();
  const hojeLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    async function carregarPainelOrbis() {
      try {
        // --- BUSCANDO ESCALAS DA API ---
        const resCiclos = await fetch(`/api/escala?t=${Date.now()}`, { cache: 'no-store' });
        const ciclosData = await resCiclos.json();
        
        let ciclosArray = [];
        if (Array.isArray(ciclosData)) {
          ciclosArray = ciclosData;
        } else if (ciclosData && ciclosData.escalas) {
          ciclosArray = ciclosData.escalas;
        }

        // --- BUSCANDO ANOTAÇÕES DA API ---
        const resCategorias = await fetch(`/api/anotacoes?t=${Date.now()}`, { cache: 'no-store' });
        const categorias = await resCategorias.json();

        let todasCriticas = [];
        let lembretesAgrupados = {};

        if (Array.isArray(categorias)) {
          for (const cat of categorias) {
            const resDetalhe = await fetch(`/api/anotacoes/${cat.id}?t=${Date.now()}`, { cache: 'no-store' });
            const detalhe = await resDetalhe.json();
            
            if (detalhe && Array.isArray(detalhe.anotacoes)) {
              // 1. Filtra Críticas
              const criticas = detalhe.anotacoes
                .filter(n => (parseInt(n.prioridade) || 0) >= 80)
                .map(n => ({ ...n, categoriaNome: cat.nome, categoriaId: cat.id }));
              todasCriticas = [...todasCriticas, ...criticas];

              // 2. Filtra Lembretes (HOJE OU NO FUTURO >=)
              const lembretes = detalhe.anotacoes.filter(n => n.dataLembrete && n.dataLembrete >= hojeLocal);
              
              if (lembretes.length > 0) {
                lembretes.sort((a, b) => new Date(a.dataLembrete) - new Date(b.dataLembrete));
                lembretesAgrupados[cat.nome] = lembretes.map(n => ({ ...n, categoriaId: cat.id }));
              }
            }
          }
        }

        setDados({ 
          escalas: ciclosArray, 
          lembretesHoje: lembretesAgrupados,
          notasCriticas: todasCriticas.sort((a, b) => b.prioridade - a.prioridade).slice(0, 3),
          loading: false 
        });
      } catch (e) {
        console.error("Erro ao orquestrar o Dashboard Orbis.", e);
        setDados(prev => ({ ...prev, loading: false }));
      }
    }
    carregarPainelOrbis();
  }, [hojeLocal]);

  // Função helper para formatar a data do lembrete (Ex: 2026-03-12 -> 12/03)
  const formatarDataCurta = (dataIso) => {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}`;
  };

  if (dados.loading) return <div className="p-10 text-indigo-500 animate-pulse font-black text-2xl tracking-tighter">Sincronizando esferas Orbis...</div>;

  const temLembretesHoje = Object.keys(dados.lembretesHoje).length > 0;

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 pb-20">
      
     

      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 shadow-lg rounded-full">
            <img src="/icon.png" alt="Orbis Central" className="w-full h-full object-contain rounded-full border-2 border-indigo-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-indigo-950 tracking-tighter uppercase -ml-1">
            rbis<span className="text-indigo-500">.hub</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl border border-indigo-100 self-start">
          <BellRing size={20} className="animate-wiggle" />
          <span className="font-bold text-xs uppercase tracking-widest">Sistemas Ativos</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==========================================
            COLUNA ESQUERDA: RESUMO DAS ESCALAS
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><CalendarClock size={20} /></div>
              <div>
                <h2 className="font-black text-indigo-950 uppercase text-sm tracking-widest">Ciclos & Escalas</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Últimos Resultados</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {dados.escalas.map(esc => {
                let nomeSorteado = esc.sorteado || "";
                let dataSorteio = esc.ultimaExecucao || "";

                // Verifica se está pendente
                const isPendente = String(nomeSorteado).trim() === "";
                
                let dataFormatada = "";
                if (typeof dataSorteio === "string" && dataSorteio.trim() !== "") {
                   dataFormatada = dataSorteio.includes(" às ") ? dataSorteio.split(" às ")[0] : dataSorteio;
                }

                return (
                  <Link href={`/escala/${esc.id}`} key={esc.id} className="block group">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-indigo-300 transition-all flex flex-col gap-3 relative overflow-hidden">
                      <div className="flex justify-between items-center z-10">
                        <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{esc.nome}</span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                      </div>
                      
                      <div className="z-10 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">
                            {isPendente ? "Status" : "Último Sorteado"}
                          </span>
                          <p className={`text-xl font-black tracking-tight leading-none ${isPendente ? 'text-gray-400 italic' : 'text-indigo-950'}`}>
                            {isPendente ? "Pendente" : nomeSorteado}
                          </p>
                        </div>

                        {!isPendente && dataFormatada && (
                          <span className="text-[10px] flex items-center gap-1.5 font-bold text-gray-600 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <Clock size={12} className="text-indigo-400" /> {dataFormatada}
                          </span>
                        )}
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CalendarClock size={72} />
                      </div>
                    </div>
                  </Link>
                )
              })}
              
              {dados.escalas.length === 0 && (
                <p className="text-sm text-gray-400 font-medium italic text-center py-6">Nenhuma escala configurada.</p>
              )}
            </div>
          </section>
        </div>

        {/* ==========================================
            COLUNA DIREITA: LEMBRETES E ALERTAS
            ========================================== */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <section className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><CheckSquare size={20} /></div>
                <div>
                  <h2 className="font-black text-emerald-950 uppercase text-sm tracking-widest">Próximas Ações</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lembretes Pendentes</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
                Ativos
              </span>
            </div>

            {temLembretesHoje ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(dados.lembretesHoje).map(([categoriaNome, notas]) => (
                  <div key={categoriaNome} className="flex flex-col gap-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">{categoriaNome}</h3>
                    <div className="flex flex-col gap-2">
                      {notas.map(nota => {
                        // Uso do hojeLocal garantindo a consistência exata do dia
                        const ehHoje = nota.dataLembrete === hojeLocal;
                        
                        return (
                          <Link href={`/anotacoes/${nota.categoriaId}`} key={nota.id} className="group">
                            <div className={`flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border hover:shadow-md transition-all ${ehHoje ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 hover:border-indigo-300'}`}>
                              <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className={`font-bold text-sm tracking-tight line-clamp-1 transition-colors ${ehHoje ? 'text-emerald-800 group-hover:text-emerald-600' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                                  {nota.titulo}
                                </span>
                                {/* Badge de Data se for no futuro */}
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                  <CalendarClock size={10} /> {formatarDataCurta(nota.dataLembrete)} {ehHoje && <span className="text-emerald-500">(Hoje)</span>}
                                </span>
                              </div>
                              <ArrowRight size={14} className={`${ehHoje ? 'text-emerald-300 group-hover:text-emerald-600' : 'text-gray-300 group-hover:text-indigo-500'} transition-transform`} />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-40 flex flex-col items-center">
                <CheckSquare size={48} className="mb-4 text-emerald-600" />
                <p className="text-lg font-bold text-emerald-950">Horizonte Livre!</p>
                <p className="text-sm">Nenhum lembrete pendente para hoje ou futuro.</p>
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Target size={20} /></div>
                <div>
                  <h2 className="font-black text-amber-950 uppercase text-sm tracking-widest">Alvos Críticos</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Notas Prioridade Máxima</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dados.notasCriticas.map(nota => (
                <Link href={`/anotacoes/${nota.categoriaId}`} key={nota.id} className="block group h-full">
                  <div className="flex flex-col justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md h-full gap-4 relative overflow-hidden">
                    <div className="flex flex-col gap-1 z-10">
                      <span className="text-[10px] uppercase font-bold text-amber-500/70 tracking-widest">{nota.categoriaNome}</span>
                      <span className="font-black text-gray-800 group-hover:text-amber-700 transition-colors leading-tight">{nota.titulo}</span>
                    </div>
                    <div className="z-10 mt-auto">
                      <PrioBadge prio={nota.prioridade} />
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-amber-600">
                      <Target size={80} />
                    </div>
                  </div>
                </Link>
              ))}
              {dados.notasCriticas.length === 0 && (
                <div className="col-span-full text-center py-10 opacity-30 flex flex-col items-center">
                  <Zap size={48} className="mb-4" />
                  <p className="text-lg font-bold">Horizonte Limpo.</p>
                  <p className="text-sm">Nenhuma nota crítica (Prioridade ≥ 80) detectada.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}