// components/anotacoes/ViewControls.js
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import LayersIcon from '@mui/icons-material/Layers';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

export default function ViewControls({
    busca, setBusca,
    filtroImportante, setFiltroImportante,
    ordenacao, setOrdenacao,
    agrupamento, setAgrupamento,
    viewMode, setViewMode
}) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 mb-8 items-center">
            <div className="flex-1 relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar nas anotações..." 
                    value={busca} 
                    onChange={(e) => setBusca(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                <button 
                    onClick={() => setFiltroImportante(!filtroImportante)} 
                    className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium border ${filtroImportante ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                    <FilterAltIcon fontSize="small" /> Importantes
                </button>
                
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
                    <SortIcon fontSize="small" className="text-gray-400 mr-2" />
                    <select 
                        value={ordenacao} 
                        onChange={(e) => setOrdenacao(e.target.value)} 
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 py-2.5 appearance-none pr-4"
                    >
                        <option value="prioridade">Maior Prioridade</option>
                        <option value="recentes">Mais Recentes</option>
                        <option value="antigas">Mais Antigas</option>
                        <option value="lembretes">Com Lembretes</option>
                    </select>
                </div>

                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
                    <LayersIcon fontSize="small" className="text-gray-400 mr-2" />
                    <select 
                        value={agrupamento} 
                        onChange={(e) => setAgrupamento(e.target.value)} 
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 py-2.5 appearance-none pr-4"
                    >
                        <option value="none">Sem Agrupar</option>
                        <option value="tags">Por Tags</option>
                        <option value="lembrete">Por Lembretes</option>
                        <option value="registro">Por Criação</option>
                    </select>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 ml-auto lg:ml-0">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`} title="Grade">
                        <ViewModuleIcon fontSize="small" />
                    </button>
                    <button onClick={() => setViewMode('pipeline')} className={`p-1.5 rounded-md transition-all ${viewMode === 'pipeline' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`} title="Pipeline (Kanban)">
                        <ViewKanbanIcon fontSize="small" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`} title="Lista">
                        <FormatListBulletedIcon fontSize="small" />
                    </button>
                </div>
            </div>
        </div>
    );
}