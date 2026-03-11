import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import StarIcon from '@mui/icons-material/Star';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PrioBadge from "./PrioBadge";

export default function NotaCard({ nota, onClick, formatarDataBR, MAPA_ICONES }) {
    return (
        <div 
            onClick={onClick} 
            className={`
                relative break-inside-avoid p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer 
                group flex flex-col h-full min-h-[180px] 
                hover:-translate-y-2 hover:rotate-1 
                hover:shadow-[10px_10px_0px_rgba(0,0,0,0.1)] 
                active:scale-95 ${nota.finalAnim}
            `}
            style={{ 
                backgroundColor: nota.finalBg, 
                color: nota.finalText, 
                borderColor: `${nota.finalText}30` 
            }}
        >
            {/* Header: Título e Tags lado a lado */}
            <div className="flex justify-between items-start gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    <h3 className="font-black leading-tight text-lg tracking-tight" style={{ color: nota.finalText }}>
                        {nota.titulo}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1">
                        {nota.sortedTags?.map(t => (
                            <span 
                                key={t.id} 
                                className="inline-flex items-center gap-1 border-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-[2px_2px_0px_rgba(0,0,0,0.1)]" 
                                style={{ backgroundColor: t.corFundo, color: t.corTexto, borderColor: t.corTexto }}
                            >
                                {MAPA_ICONES[t.icone] || MAPA_ICONES["Tag"]} {t.texto}
                            </span>
                        ))}
                    </div>
                </div>
                {nota.importante && (
                    <StarIcon className="shrink-0 animate-pulse" fontSize="small" style={{ color: nota.finalText }} />
                )}
            </div>
            
            {/* Conteúdo com efeito de profundidade */}
            <div className="text-sm line-clamp-4 markdown-preview overflow-hidden relative opacity-80 flex-1 font-medium italic">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{nota.conteudo || "*Espaço para insights...*"}</ReactMarkdown>
                <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: `linear-gradient(to top, ${nota.finalBg}, transparent)` }}></div>
            </div>

            {/* Rodapé: Prioridade na esquerda e Data na direita */}
            <div className="mt-4 pt-3 flex flex-col gap-3 border-t-2" style={{ borderColor: `${nota.finalText}15` }}>
                {nota.dataLembrete && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black w-fit px-2 py-1 rounded-md border-2" 
                         style={{ backgroundColor: `${nota.finalText}10`, color: nota.finalText, borderColor: `${nota.finalText}20` }}>
                        <NotificationsActiveIcon sx={{ fontSize: 14 }} /> {formatarDataBR(nota.dataLembrete)}
                    </div>
                )}
                
                <div className="flex justify-between items-end w-full">
                    <PrioBadge prio={nota.finalPrio} />
                    <div className="text-[9px] font-black opacity-40 uppercase tracking-widest">
                        {formatarDataBR(nota.dataRegistro)}
                    </div>
                </div>
            </div>
        </div>
    );
}