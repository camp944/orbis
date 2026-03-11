// components/anotacoes/PrioBadge.js
export default function PrioBadge({ prio, className = "" }) {
    let icon = "☕"; 
    let label = "Relax"; 
    let color = "bg-gray-100 text-gray-500 border-gray-200";
    
    if (prio >= 80) { 
        icon = "🔥"; 
        label = "Urgente"; 
        color = "bg-red-100 text-red-700 border-red-200"; 
    } else if (prio >= 50) { 
        icon = "⚡"; 
        label = "Alta"; 
        color = "bg-orange-100 text-orange-700 border-orange-200"; 
    } else if (prio >= 20) { 
        icon = "🚀"; 
        label = "Média"; 
        color = "bg-blue-100 text-blue-700 border-blue-200"; 
    } else if (prio > 0) { 
        icon = "🐢"; 
        label = "Baixa"; 
        color = "bg-green-100 text-green-700 border-green-200"; 
    }
    
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm border text-[10px] font-extrabold ${color} ${className}`}>
        <span className="text-sm drop-shadow-sm">{icon}</span>
        <span className="uppercase tracking-wider hidden sm:inline">{label}</span>
        <span className="bg-black/10 px-1.5 py-0.5 rounded-md ml-0.5">{prio}</span>
      </div>
    );
}