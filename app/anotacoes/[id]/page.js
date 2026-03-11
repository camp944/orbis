"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Nossos Componentes Novos!
import PrioBadge from "@/components/anotacoes/PrioBadge";
import ViewControls from "@/components/anotacoes/ViewControls";
import NotaCard from "@/components/anotacoes/NotaCard";

// Ícones UI (Apenas os que o Modal ainda usa)
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StyleIcon from '@mui/icons-material/Style';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Ícones das Tags 
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import FlagIcon from '@mui/icons-material/Flag';
import PushPinIcon from '@mui/icons-material/PushPin';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';

const MAPA_ICONES = {
  "Tag": <LocalOfferIcon fontSize="inherit" />, "Work": <WorkIcon fontSize="inherit" />,
  "Person": <PersonIcon fontSize="inherit" />, "Code": <CodeIcon fontSize="inherit" />,
  "Task": <AssignmentIcon fontSize="inherit" />, "Warning": <WarningIcon fontSize="inherit" />,
  "Heart": <FavoriteIcon fontSize="inherit" />, "Money": <AttachMoneyIcon fontSize="inherit" />,
  "Idea": <LightbulbIcon fontSize="inherit" />, "Check": <CheckCircleOutlineIcon fontSize="inherit" />,
  "Info": <InfoIcon fontSize="inherit" />, "Flag": <FlagIcon fontSize="inherit" />,
  "Pin": <PushPinIcon fontSize="inherit" />, "Bookmark": <BookmarkIcon fontSize="inherit" />,
  "Error": <ErrorOutlineIcon fontSize="inherit" />, "Event": <EventIcon fontSize="inherit" />,
  "Build": <BuildIcon fontSize="inherit" />
};

const ANIMACOES = [
  { id: "", label: "Nenhuma" },
  { id: "animate-pulse", label: "Pulsar (Suave)" },
  { id: "animate-bounce", label: "Quicar (Bounce)" },
  { id: "animate-ping", label: "Sinal (Ping)" },
  { id: "animate-shake", label: "Tremer Rápido" },
  { id: "animate-wiggle", label: "Balançar" },
  { id: "animate-heartbeat", label: "Coração Batendo" },
  { id: "animate-flash", label: "Piscar Lento" },
];

const PALETAS_SOFISTICADAS = [
  { bg: "#ffffff", text: "#1e293b", label: "Minimalista Branco" },
  { bg: "#fef3c7", text: "#92400e", label: "Amarelo Clássico" },
  { bg: "#e0f2fe", text: "#0369a1", label: "Azul Sereno" },
  { bg: "#dcfce7", text: "#15803d", label: "Verde Menta" },
  { bg: "#f3e8ff", text: "#7e22ce", label: "Lavanda" },
  { bg: "#ffe4e6", text: "#be123c", label: "Rosa Suave" },
  { bg: "#1e293b", text: "#f8fafc", label: "Modo Escuro" }
];

export default function AnotacoesPage() {
  const params = useParams();
  const pathname = usePathname();
  const idCategoria = params?.id || (pathname ? pathname.split('/').pop() : null);

  const [nomeCategoria, setNomeCategoria] = useState("");
  const [anotacoes, setAnotacoes] = useState([]);
  const [tagsDesteMural, setTagsDesteMural] = useState([]);
  const [todasCategoriasGlobais, setTodasCategoriasGlobais] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroImportante, setFiltroImportante] = useState(false);
  const [ordenacao, setOrdenacao] = useState("prioridade");

  const [viewMode, setViewMode] = useState("grid");
  const [agrupamento, setAgrupamento] = useState("none");

  const [notaExpandida, setNotaExpandida] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [notaForm, setNotaForm] = useState({ titulo: "", conteudo: "", importante: false, dataLembrete: "", tags: [], corFundo: "#ffffff", corTexto: "#1e293b", animacao: "", prioridade: 0 });

  const [modalTagsAberto, setModalTagsAberto] = useState(false);
  const [tagForm, setTagForm] = useState({ id: null, texto: "", icone: "Tag", corFundo: "#ffffff", corTexto: "#1e293b", animacao: "", prioridade: 0 });

  useEffect(() => { carregarDados(); }, [idCategoria]);

  const carregarDados = async () => {
    if (!idCategoria) return;
    setLoading(true);
    try {
      const resLocal = await fetch(`/api/anotacoes/${idCategoria}`);
      if (resLocal.ok) {
        const json = await resLocal.json();
        setNomeCategoria(json.nome);
        setAnotacoes(json.anotacoes);
        setTagsDesteMural(json.tagsDisponiveis || []);
      }
      const resGlobal = await fetch("/api/anotacoes");
      if (resGlobal.ok) setTodasCategoriasGlobais(await resGlobal.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const salvarAnotacao = async () => {
    if (!notaForm.titulo.trim()) return alert("O título é obrigatório!");
    setLoading(true);
    try {
      const res = await fetch(`/api/anotacoes/${idCategoria}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: notaForm.id ? "atualizar" : "criar", nota: notaForm })
      });
      const json = await res.json();
      if (res.ok) { setAnotacoes(json.anotacoes); fecharModal(); }
    } catch (e) { }
    setLoading(false);
  };

  const excluirAnotacao = async (id) => {
    if (!confirm("Excluir esta anotação?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/anotacoes/${idCategoria}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "deletar", nota: { id } })
      });
      const json = await res.json();
      if (res.ok) { setAnotacoes(json.anotacoes); fecharModal(); }
    } catch (e) { }
    setLoading(false);
  };

  const salvarTag = async () => {
    if (!tagForm.texto.trim()) return;
    setLoading(true);
    try {
      const acao = tagForm.id ? "editar_tag" : "criar_tag";
      const res = await fetch(`/api/anotacoes/${idCategoria}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, tag: { ...tagForm, origem: nomeCategoria } })
      });
      const json = await res.json();
      if (res.ok) {
        setTagsDesteMural(json.tagsDisponiveis);
        setTagForm({ id: null, texto: "", icone: "Tag", corFundo: "#ffffff", corTexto: "#1e293b", animacao: "", prioridade: 0 });
      }
    } catch (e) { }
    setLoading(false);
  };

  const deletarTag = async (tagId) => {
    if (!confirm("Excluir esta Tag?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/anotacoes/${idCategoria}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "deletar_tag", tagId })
      });
      const json = await res.json();
      if (res.ok) setTagsDesteMural(json.tagsDisponiveis);
    } catch (e) { }
    setLoading(false);
  };

  const toggleTagNaAnotacao = (tagInteira) => {
    const tagsAtuais = notaForm.tags || [];
    const temTag = tagsAtuais.find(t => t.id === tagInteira.id);
    if (temTag) setNotaForm({ ...notaForm, tags: tagsAtuais.filter(t => t.id !== tagInteira.id) });
    else setNotaForm({ ...notaForm, tags: [...tagsAtuais, tagInteira] });
  };

  const abrirNovaNota = () => { setNotaForm({ titulo: "", conteudo: "", importante: false, dataLembrete: "", tags: [], corFundo: "#ffffff", corTexto: "#1e293b", animacao: "", prioridade: 0 }); setModoEdicao(true); setNotaExpandida({}); };
  const fecharModal = () => { setNotaExpandida(null); setModoEdicao(false); };

  const formatarDataBR = (dataString) => {
    if (!dataString) return "";
    if (dataString.includes("-")) {
      const [ano, mes, dia] = dataString.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return dataString.split(" às ")[0];
  };

  const tagsOutrosMurais = todasCategoriasGlobais.filter(cat => cat.id !== idCategoria).flatMap(cat => cat.tagsDisponiveis.map(t => ({ ...t, origem: cat.nome })));
  let anotacoesExibidas = [...anotacoes];

  if (busca) {
    const t = busca.toLowerCase();
    anotacoesExibidas = anotacoesExibidas.filter(n => n.titulo.toLowerCase().includes(t) || n.conteudo.toLowerCase().includes(t));
  }
  if (filtroImportante) anotacoesExibidas = anotacoesExibidas.filter(n => n.importante);

  // --- CÁLCULO DE HERANÇA ---
  const anotacoesComputadas = anotacoesExibidas.map(nota => {
    let finalPrio = parseInt(nota.prioridade) || 0;
    const finalBg = nota.corFundo || "#ffffff";
    const finalText = nota.corTexto || "#1e2937";
    let finalAnim = nota.animacao || "";
    let sortedTags = [];

    if (nota.tags && nota.tags.length > 0) {
      sortedTags = [...nota.tags].sort((a, b) => {
        const prioA = parseInt(a.prioridade) || 0;
        const prioB = parseInt(b.prioridade) || 0;
        if (prioA !== prioB) return prioB - prioA;
        return (a.texto || "").localeCompare(b.texto || "");
      });
      const tagDominante = sortedTags[0];
      const maxTagPrio = parseInt(tagDominante.prioridade) || 0;
      finalPrio = Math.max(finalPrio, maxTagPrio);
      if (tagDominante.animacao) finalAnim = tagDominante.animacao;
    }

    return { ...nota, finalPrio, finalBg, finalText, finalAnim, sortedTags };
  });

  anotacoesComputadas.sort((a, b) => {
    if (ordenacao === "prioridade") return b.finalPrio - a.finalPrio || new Date(b.dataRegistroIso) - new Date(a.dataRegistroIso);
    if (ordenacao === "recentes") return new Date(b.dataRegistroIso) - new Date(a.dataRegistroIso);
    if (ordenacao === "antigas") return new Date(a.dataRegistroIso) - new Date(b.dataRegistroIso);
    if (ordenacao === "lembretes") { if (a.dataLembrete && !b.dataLembrete) return -1; if (!a.dataLembrete && b.dataLembrete) return 1; return 0; }
    return 0;
  });

  // --- LÓGICA DE AGRUPAMENTO (PIPELINE / LISTAS) ---
  const obterGrupos = () => {
    if (agrupamento === "none") return [{ titulo: "Todas as Anotações", notas: anotacoesComputadas }];
    const map = {};

    if (agrupamento === "tags") {
      anotacoesComputadas.forEach(nota => {
        if (!nota.tags || nota.tags.length === 0) {
          if (!map["Sem Tag"]) map["Sem Tag"] = [];
          map["Sem Tag"].push(nota);
        } else {
          nota.tags.forEach(t => {
            if (!map[t.texto]) map[t.texto] = [];
            map[t.texto].push(nota);
          });
        }
      });
      return Object.keys(map).sort((a, b) => a === "Sem Tag" ? 1 : b === "Sem Tag" ? -1 : a.localeCompare(b)).map(k => ({ titulo: k, notas: map[k] }));
    }

    if (agrupamento === "lembrete") {
      const hojeIso = new Date().toISOString().split('T')[0];
      anotacoesComputadas.forEach(nota => {
        if (!nota.dataLembrete) { if (!map["Sem Lembrete"]) map["Sem Lembrete"] = []; map["Sem Lembrete"].push(nota); }
        else if (nota.dataLembrete < hojeIso) { if (!map["Atrasados"]) map["Atrasados"] = []; map["Atrasados"].push(nota); }
        else if (nota.dataLembrete === hojeIso) { if (!map["Para Hoje"]) map["Para Hoje"] = []; map["Para Hoje"].push(nota); }
        else { if (!map["No Futuro"]) map["No Futuro"] = []; map["No Futuro"].push(nota); }
      });
      const order = ["Atrasados", "Para Hoje", "No Futuro", "Sem Lembrete"];
      return order.filter(k => map[k]).map(k => ({ titulo: k, notas: map[k] }));
    }

    if (agrupamento === "registro") {
      const hojeBr = new Date().toLocaleDateString('pt-BR');
      anotacoesComputadas.forEach(nota => {
        const dataReg = formatarDataBR(nota.dataRegistroIso.split('T')[0]);
        if (dataReg === hojeBr) { if (!map["Criado Hoje"]) map["Criado Hoje"] = []; map["Criado Hoje"].push(nota); }
        else { if (!map["Anteriores"]) map["Anteriores"] = []; map["Anteriores"].push(nota); }
      });
      return [{ titulo: "Criado Hoje", notas: map["Criado Hoje"] || [] }, { titulo: "Anteriores", notas: map["Anteriores"] || [] }].filter(g => g.notas.length > 0);
    }
  };

  const gruposExibicao = obterGrupos();

  // --- CÁLCULO DE HERANÇA DO MODAL ---
  let modalPrio = parseInt(notaForm?.prioridade) || 0;
  let modalBg = notaForm?.corFundo || "#ffffff";
  let modalText = notaForm?.corTexto || "#1e293b";
  let modalAnim = notaForm?.animacao || "";
  let sortedModalTags = [];

  if (notaForm?.tags && notaForm.tags.length > 0) {
    sortedModalTags = [...notaForm.tags].sort((a, b) => {
      const prioA = parseInt(a.prioridade) || 0;
      const prioB = parseInt(b.prioridade) || 0;
      if (prioA !== prioB) return prioB - prioA;
      return (a.texto || "").localeCompare(b.texto || "");
    });
    const tagDominanteModal = sortedModalTags[0];
    const maxTagPrioModal = parseInt(tagDominanteModal.prioridade) || 0;
    modalPrio = Math.max(modalPrio, maxTagPrioModal);
    if (tagDominanteModal.animacao) modalAnim = tagDominanteModal.animacao;
  }

  return (
    <div className="flex flex-col h-full w-full p-6 bg-gray-50 overflow-y-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">{nomeCategoria || "Carregando..."}</h1>
          <p className="text-sm text-indigo-400 font-medium mt-1">Gerencie suas ideias, tarefas e lembretes.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setModalTagsAberto(true)} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all">
            <StyleIcon fontSize="small" /> Tags do Mural
          </button>
          <button onClick={abrirNovaNota} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all">
            <AddIcon /> Nova Anotação
          </button>
        </div>
      </div>

      {/* COMPONENTE: CONTROLES DE VISUALIZAÇÃO */}
      <ViewControls
        busca={busca} setBusca={setBusca}
        filtroImportante={filtroImportante} setFiltroImportante={setFiltroImportante}
        ordenacao={ordenacao} setOrdenacao={setOrdenacao}
        agrupamento={agrupamento} setAgrupamento={setAgrupamento}
        viewMode={viewMode} setViewMode={setViewMode}
      />

      {/* ÁREA DE RENDERIZAÇÃO PRINCIPAL */}
      {loading && !notaExpandida ? <div className="flex justify-center py-20 text-indigo-500">Carregando...</div> : anotacoesComputadas.length === 0 ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center"><LocalOfferIcon className="text-6xl mb-4 opacity-20" /><p>Nenhuma anotação.</p></div>
      ) : (
        <div className="flex-1 w-full relative">

          {/* MODO: GRID / MASONRY */}
          {viewMode === "grid" && (
            <div className="flex flex-col gap-10 pb-10">
              {gruposExibicao.map(grupo => (
                <div key={grupo.titulo}>
                  {agrupamento !== "none" && <h2 className="font-bold text-gray-500 mb-6 flex items-center gap-2 text-lg uppercase tracking-wider">{grupo.titulo} <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full">{grupo.notas.length}</span></h2>}
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {/* COMPONENTE: NOTA CARD */}
                    {grupo.notas.map(nota => (
                      <NotaCard key={nota.id} nota={nota} onClick={() => { setNotaExpandida(nota); setNotaForm({ ...nota, tags: nota.tags || [] }); setModoEdicao(false); }} formatarDataBR={formatarDataBR} MAPA_ICONES={MAPA_ICONES} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODO: PIPELINE (KANBAN) */}
          {viewMode === "pipeline" && (
            <div className="flex gap-6 overflow-x-auto pb-10 items-start h-full custom-scrollbar flex-nowrap">
              {gruposExibicao.map(grupo => (
                <div key={grupo.titulo} className="min-w-[320px] max-w-[320px] bg-gray-200/40 border border-gray-200 rounded-3xl p-4 flex flex-col gap-4 max-h-full">
                  <h2 className="font-bold text-gray-700 flex justify-between items-center px-1 uppercase tracking-wide text-sm">
                    {grupo.titulo} <span className="bg-white text-gray-600 text-xs px-2.5 py-1 rounded-full shadow-sm">{grupo.notas.length}</span>
                  </h2>
                  <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 pb-2 h-full pt-4">
                    {/* COMPONENTE: NOTA CARD */}
                    {grupo.notas.map(nota => (
                      <NotaCard key={nota.id} nota={nota} onClick={() => { setNotaExpandida(nota); setNotaForm({ ...nota, tags: nota.tags || [] }); setModoEdicao(false); }} formatarDataBR={formatarDataBR} MAPA_ICONES={MAPA_ICONES} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODO: LISTA */}
          {viewMode === "list" && (
            <div className="flex flex-col gap-8 pb-10">
              {gruposExibicao.map(grupo => (
                <div key={grupo.titulo} className="flex flex-col gap-3">
                  {agrupamento !== "none" && <h2 className="font-bold text-gray-500 border-b border-gray-200 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide text-sm">{grupo.titulo} <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{grupo.notas.length}</span></h2>}
                  <div className="flex flex-col gap-2">
                    {grupo.notas.map(nota => (
                      <div key={nota.id} onClick={() => { setNotaExpandida(nota); setNotaForm({ ...nota, tags: nota.tags || [] }); setModoEdicao(false); }} className={`flex items-center justify-between p-3 border rounded-xl hover:shadow-md cursor-pointer transition-all ${nota.finalAnim}`} style={{ backgroundColor: nota.finalBg, color: nota.finalText, borderColor: `${nota.finalText}20` }}>
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                          <h3 className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-[400px]">{nota.importante && <StarIcon fontSize="small" className="mr-1 inline -mt-1 text-amber-500" />}{nota.titulo}</h3>
                          <div className="hidden sm:flex flex-wrap gap-1">
                            {nota.sortedTags?.map(t => <span key={t.id} className="px-2 py-0.5 text-[9px] rounded-full uppercase font-bold border shadow-sm" style={{ backgroundColor: t.corFundo, color: t.corTexto, borderColor: t.corTexto }}>{MAPA_ICONES[t.icone]} {t.texto}</span>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pl-4 border-l" style={{ borderColor: `${nota.finalText}20` }}>
                          <div className="text-xs opacity-60 hidden md:block whitespace-nowrap">{formatarDataBR(nota.dataRegistro)}</div>
                          <PrioBadge prio={nota.finalPrio} className="scale-90 transform origin-right" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DO POST-IT - COM A CORREÇÃO DE ALTURA (h-[85vh]) */}
      {notaExpandida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-gray-900/60 transition-opacity">
          <div className={`rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border animate-slide-up ${notaExpandida.finalAnim || notaForm.animacao}`} style={{ backgroundColor: notaForm.corFundo || "#ffffff" }}>

            <div className="px-6 py-4 border-b flex justify-between items-center bg-white/40 backdrop-blur-sm shrink-0" style={{ borderColor: `${notaForm.corTexto}20` }}>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded`} style={{ backgroundColor: `${notaForm.corTexto}15`, color: notaForm.corTexto }}>
                {modoEdicao ? 'Editando...' : 'Leitura'}
              </span>
              <div className="flex items-center gap-2">
                {!modoEdicao && (
                  <>
                    <button onClick={() => setModoEdicao(true)} className="p-2 rounded-lg hover:bg-black/10 transition-all" style={{ color: notaForm.corTexto }}><EditIcon fontSize="small" /></button>
                    {notaForm.id && <button onClick={() => excluirAnotacao(notaForm.id)} className="p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all" style={{ color: notaForm.corTexto }}><DeleteIcon fontSize="small" /></button>}
                    <div className="w-px h-6 mx-1" style={{ backgroundColor: `${notaForm.corTexto}20` }}></div>
                  </>
                )}
                <button onClick={fecharModal} className="p-2 rounded-lg hover:bg-black/10 transition-all" style={{ color: notaForm.corTexto }}><CloseIcon /></button>
              </div>
            </div>

            <div className="p-6 overflow-hidden flex-1 flex flex-col md:flex-row gap-8 bg-white/40">
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {modoEdicao ? (
                  <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
                    <div className="flex gap-4 items-start shrink-0">
                      <input type="text" value={notaForm.titulo} onChange={e => setNotaForm({ ...notaForm, titulo: e.target.value })} placeholder="Título..." className="flex-1 text-2xl font-bold bg-transparent border-b-2 outline-none py-2 px-1" style={{ color: notaForm.corTexto, borderColor: `${notaForm.corTexto}40` }} autoFocus />
                      <button onClick={() => setNotaForm({ ...notaForm, importante: !notaForm.importante })} className={`p-2 rounded-xl border`} style={{ color: notaForm.importante ? '#f59e0b' : notaForm.corTexto, borderColor: `${notaForm.corTexto}30`, backgroundColor: notaForm.importante ? '#f59e0b20' : 'transparent' }}><StarIcon /></button>
                    </div>

                    <div className="flex flex-col gap-3 bg-white/60 p-4 rounded-xl border border-black/5 shadow-inner shrink-0" style={{ borderColor: `${notaForm.corTexto}20` }}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-black/5 pb-3">
                        <label className="text-[10px] font-bold uppercase opacity-70 w-24" style={{ color: notaForm.corTexto }}>Temas Prontos</label>
                        <div className="flex flex-wrap gap-2">
                          {PALETAS_SOFISTICADAS.map(p => (
                            <button key={p.label} onClick={() => setNotaForm({ ...notaForm, corFundo: p.bg, corTexto: p.text })} className={`w-6 h-6 rounded-full border border-black/20 shadow-sm transition-transform hover:scale-110 flex items-center justify-center`} style={{ backgroundColor: p.bg }} title={p.label}>
                              {notaForm.corFundo === p.bg && <CheckCircleIcon sx={{ fontSize: 14, color: p.text }} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 items-end">
                        <div>
                          <label className="text-[10px] font-bold uppercase opacity-70 block mb-1" style={{ color: notaForm.corTexto }}>Prioridade Base</label>
                          <input type="number" min="0" max="99" value={notaForm.prioridade || 0} onChange={e => setNotaForm({ ...notaForm, prioridade: e.target.value })} className="w-16 px-2 py-1.5 border rounded-lg text-sm outline-none bg-white/80" style={{ borderColor: `${notaForm.corTexto}30`, color: notaForm.corTexto }} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase opacity-70 flex items-center gap-1 mb-1" style={{ color: notaForm.corTexto }}><PaletteIcon fontSize="inherit" /> Fundo</label>
                          <input type="color" value={notaForm.corFundo || "#ffffff"} onChange={e => setNotaForm({ ...notaForm, corFundo: e.target.value })} className="block w-full h-8 p-0 border-0 rounded cursor-pointer bg-transparent" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase opacity-70 flex items-center gap-1 mb-1" style={{ color: notaForm.corTexto }}><PaletteIcon fontSize="inherit" /> Texto</label>
                          <input type="color" value={notaForm.corTexto || "#1e293b"} onChange={e => setNotaForm({ ...notaForm, corTexto: e.target.value })} className="block w-full h-8 p-0 border-0 rounded cursor-pointer bg-transparent" />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[10px] font-bold uppercase opacity-70 block mb-1" style={{ color: notaForm.corTexto }}>Animação</label>
                          <select value={notaForm.animacao} onChange={e => setNotaForm({ ...notaForm, animacao: e.target.value })} className="w-full px-2 py-1.5 border rounded-lg text-sm outline-none bg-white/80" style={{ borderColor: `${notaForm.corTexto}30`, color: notaForm.corTexto }}>
                            {ANIMACOES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                          </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[10px] font-bold uppercase opacity-70 block mb-1" style={{ color: notaForm.corTexto }}>Lembrete</label>
                          <input type="date" value={notaForm.dataLembrete || ""} onChange={e => setNotaForm({ ...notaForm, dataLembrete: e.target.value })} className="w-full px-2 py-1.5 border rounded-lg text-sm outline-none bg-white/80" style={{ borderColor: `${notaForm.corTexto}30`, color: notaForm.corTexto }} />
                        </div>
                      </div>
                    </div>

                    <textarea value={notaForm.conteudo} onChange={e => setNotaForm({ ...notaForm, conteudo: e.target.value })} placeholder="Conteúdo Markdown..." className="w-full flex-1 min-h-[200px] p-4 bg-white/50 border rounded-xl font-mono text-sm outline-none resize-none custom-scrollbar" style={{ borderColor: `${notaForm.corTexto}20`, color: notaForm.corTexto }}></textarea>
                  </div>
                ) : (
                  <div className="flex flex-col h-full overflow-hidden" style={{ color: modalText }}>
                    <div className="flex flex-wrap items-center gap-3 mb-6 shrink-0">
                      <h2 className="text-3xl font-extrabold">{notaForm.titulo}</h2>
                      {/* TAGS AO LADO DO TÍTULO NO MODO LEITURA */}
                      {sortedModalTags.length > 0 && sortedModalTags.map(t => (
                        <span key={t.id} className="inline-flex items-center gap-1 border text-[11px] font-bold px-2 py-1 rounded-full uppercase" style={{ backgroundColor: t.corFundo, color: t.corTexto, borderColor: t.corTexto }}>
                          {MAPA_ICONES[t.icone] || MAPA_ICONES["Tag"]} {t.texto}
                        </span>
                      ))}
                    </div>

                    <div className="prose prose-sm sm:prose-base max-w-none opacity-90 flex-1 overflow-y-auto custom-scrollbar pr-4" style={{ color: 'inherit' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{notaForm.conteudo}</ReactMarkdown>
                    </div>

                    {/* NOVO RODAPÉ NO MODO DE LEITURA DO MODAL */}
                    <div className="mt-4 pt-4 border-t shrink-0 flex justify-between items-end" style={{ borderColor: `${modalText}20` }}>
                      <PrioBadge prio={modalPrio} className="scale-110 origin-left shadow-sm" />
                      <div className="flex flex-col items-end gap-1 text-xs opacity-70 font-medium">
                        {notaForm.dataLembrete && <span>🔔 Lembrete: {formatarDataBR(notaForm.dataLembrete)}</span>}
                        <span>Criado em: {formatarDataBR(notaForm.dataRegistro)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA (Apenas no Modo Edição agora) */}
              {modoEdicao && (
                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6 overflow-y-auto custom-scrollbar" style={{ borderColor: `${notaForm.corTexto}20` }}>
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase mb-3 opacity-80" style={{ color: notaForm.corTexto }}>Tags deste Mural</h3>
                      <div className="flex flex-wrap gap-2">
                        {tagsDesteMural.map(t => {
                          const isSelected = notaForm.tags?.find(tag => tag.id === t.id);
                          return (
                            <button key={t.id} onClick={() => toggleTagNaAnotacao(t)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${isSelected ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: t.corFundo, color: t.corTexto, borderColor: t.corTexto, outlineColor: t.corTexto }}>
                              {MAPA_ICONES[t.icone] || MAPA_ICONES["Tag"]} {t.texto}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase mb-3 border-t pt-4 opacity-60" style={{ color: notaForm.corTexto, borderColor: `${notaForm.corTexto}20` }}>De outros murais</h3>
                      <div className="flex flex-wrap gap-2">
                        {tagsOutrosMurais.map(t => {
                          const isSelected = notaForm.tags?.find(tag => tag.id === t.id);
                          return (
                            <button key={t.id} onClick={() => toggleTagNaAnotacao(t)} className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded border transition-all ${isSelected ? 'opacity-100 ring-1 ring-offset-1' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: t.corFundo, color: t.corTexto, borderColor: t.corTexto }} title={t.origem}>
                              {MAPA_ICONES[t.icone]} {t.texto}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {modoEdicao && (
              <div className="p-4 border-t flex justify-end gap-3 bg-white shrink-0" style={{ borderColor: `${notaForm.corTexto}20` }}>
                <button onClick={() => notaForm.id ? setModoEdicao(false) : fecharModal()} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium">Cancelar</button>
                <button onClick={salvarAnotacao} disabled={loading} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50">Salvar Anotação</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL GERENCIADOR DE TAGS */}
      {modalTagsAberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-700">{tagForm.id ? "Editando Tag" : "Nova Tag"}</h2>
              <button onClick={() => { setModalTagsAberto(false); setTagForm({ id: null, texto: "", icone: "Tag", corFundo: "#ffffff", corTexto: "#1e293b", animacao: "", prioridade: 0 }); }} className="text-gray-400"><CloseIcon /></button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Texto da Tag</label>
                  <input type="text" value={tagForm.texto} onChange={e => setTagForm({ ...tagForm, texto: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 outline-none focus:border-indigo-500" />
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Prioridade</label>
                  <input type="number" min="0" max="99" value={tagForm.prioridade || 0} onChange={e => setTagForm({ ...tagForm, prioridade: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Cores Prontas</label>
                <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {PALETAS_SOFISTICADAS.map(p => (
                    <button key={p.label} onClick={() => setTagForm({ ...tagForm, corFundo: p.bg, corTexto: p.text })} className={`w-6 h-6 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-110 flex items-center justify-center`} style={{ backgroundColor: p.bg }} title={p.label}>
                      {tagForm.corFundo === p.bg && <CheckCircleIcon sx={{ fontSize: 14, color: p.text }} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-16">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Fundo</label>
                  <input type="color" value={tagForm.corFundo || "#ffffff"} onChange={e => setTagForm({ ...tagForm, corFundo: e.target.value })} className="w-full h-10 p-1 border rounded-lg mt-1 cursor-pointer bg-white" />
                </div>
                <div className="w-16">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Texto</label>
                  <input type="color" value={tagForm.corTexto || "#1e293b"} onChange={e => setTagForm({ ...tagForm, corTexto: e.target.value })} className="w-full h-10 p-1 border rounded-lg mt-1 cursor-pointer bg-white" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Animação no Card</label>
                  <select value={tagForm.animacao} onChange={e => setTagForm({ ...tagForm, animacao: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 outline-none h-10 focus:border-indigo-500">
                    {ANIMACOES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(MAPA_ICONES).map(key => (
                    <button key={key} onClick={() => setTagForm({ ...tagForm, icone: key })} className={`p-2 rounded-lg border ${tagForm.icone === key ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200'}`}>
                      {MAPA_ICONES[key]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                {tagForm.id && <button onClick={() => setTagForm({ id: null, texto: "", icone: "Tag", corFundo: "#ffffff", corTexto: "#1e293b", animacao: "", prioridade: 0 })} className="px-4 py-2 border rounded-lg bg-gray-50">Cancelar Edição</button>}
                <button onClick={salvarTag} disabled={!tagForm.texto.trim()} className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg disabled:opacity-50">
                  {tagForm.id ? "Atualizar Tag" : "Adicionar Tag"}
                </button>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Suas Tags</label>
                <ul className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {tagsDesteMural.map(t => (
                    <li key={t.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      <span className="flex items-center gap-2 text-xs font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: t.corFundo, color: t.corTexto, borderColor: t.corTexto }}>
                        {MAPA_ICONES[t.icone]} {t.texto} {t.prioridade > 0 && `(P${t.prioridade})`}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => setTagForm(t)} className="text-blue-500 p-1 hover:text-blue-700"><EditIcon fontSize="small" /></button>
                        <button onClick={() => deletarTag(t.id)} className="text-red-400 p-1 hover:text-red-600"><DeleteIcon fontSize="small" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        /* Substitua ou adicione dentro da tag <style> */
        @keyframes gentle-bounce {0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(-8px); animation-timing-function: cubic-bezier(0, 0, -0.2, 1); }}
        .animate-bounce {animation: gentle-bounce 1.5s infinite !important;}
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s ease-in-out infinite; }
        @keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        .animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
        @keyframes flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0.6; } }
        .animate-flash { animation: flash 2s linear infinite; }
      `}} />
    </div>
  );
}