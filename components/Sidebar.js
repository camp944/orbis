"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Ícones do Material UI
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ViewListIcon from '@mui/icons-material/ViewList'; // Novo ícone genérico para as escalas

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuEscalasOpen, setMenuEscalasOpen] = useState(true);
  const [menuAnotacoesOpen, setMenuAnotacoesOpen] = useState(true);

  // Estados para guardar os dados dinâmicos do banco
  const [escalasDisponiveis, setEscalasDisponiveis] = useState([]);
  const [categoriasAnotacoes, setCategoriasAnotacoes] = useState([]);

  useEffect(() => {
    const buscarDadosSidebar = async () => {
      try {
        // Busca as Escalas Dinâmicas
        const resEscalas = await fetch("/api/escala");
        if (resEscalas.ok) {
          setEscalasDisponiveis(await resEscalas.json());
        }

        // Busca as Anotações Dinâmicas
        const resAnotacoes = await fetch("/api/anotacoes");
        if (resAnotacoes.ok) {
          setCategoriasAnotacoes(await resAnotacoes.json());
        }
      } catch (error) {
        console.error("Erro ao carregar dados da Sidebar:", error);
      }
    };

    buscarDadosSidebar();
  }, []);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const toggleEscalas = () => setMenuEscalasOpen(!menuEscalasOpen);
  const toggleAnotacoes = () => setMenuAnotacoesOpen(!menuAnotacoesOpen);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#1e1b4b] text-white shadow-2xl">
      <div className="p-6 flex justify-around items-center border-b border-indigo-800/50">
        <div className="flex items-center gap-1  px-2 justify-around">
          <img src="/icon.png" className="w-22 h-22 rounded-full border border-white/20 shadow-sm" alt="O" />
          {/* <span className="text-2xl font-black tracking-tighter text-white">rbis</span> */}
        </div>
        <button className="md:hidden text-indigo-300 hover:text-white" onClick={toggleMobile}>
          <CloseIcon />
        </button>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Menu Principal */}
        <Link href="/">
          <div className={`px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm flex items-center gap-3 ${pathname === "/" ? "bg-indigo-600 text-white shadow-md" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"}`}>
            <HomeIcon fontSize="small" /> Início
          </div>
        </Link>

        {/* Submenu de Escalas (AGORA DINÂMICO!) */}
        <div className="pt-2">
          <div
            onClick={toggleEscalas}
            className="px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm flex items-center justify-between text-indigo-200 hover:bg-indigo-800 hover:text-white select-none"
          >
            <div className="flex items-center gap-3">
              <CalendarMonthIcon fontSize="small" /> Escalas
            </div>
            {menuEscalasOpen ? <ExpandMoreIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </div>

          {menuEscalasOpen && (
            <div className="ml-5 mt-1 space-y-1 border-l border-indigo-700 pl-3 transition-all">
              {escalasDisponiveis.map((escala) => {
                const caminho = `/escala/${escala.id}`;
                const isActive = pathname === caminho;
                return (
                  <Link key={escala.id} href={caminho}>
                    <div className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer text-sm flex items-center gap-3 ${isActive ? "bg-indigo-600/60 text-white shadow-inner" : "text-indigo-300 hover:bg-indigo-800 hover:text-white"}`}>
                      <ViewListIcon fontSize="small" className="opacity-70" /> {escala.nome}
                    </div>
                  </Link>
                );
              })}

              <Link href="/nova-escala">
                <div className="px-4 py-2.5 rounded-lg transition-all cursor-pointer text-sm flex items-center gap-3 text-indigo-400 hover:text-indigo-200 opacity-70 hover:opacity-100 border border-dashed border-indigo-700 mt-2">
                  <AddCircleOutlineIcon fontSize="small" /> Nova Escala
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Submenu de Anotações */}
        <div className="pt-2">
          <div
            onClick={toggleAnotacoes}
            className="px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm flex items-center justify-between text-indigo-200 hover:bg-indigo-800 hover:text-white select-none"
          >
            <div className="flex items-center gap-3">
              <EditNoteIcon fontSize="small" /> Anotações
            </div>
            {menuAnotacoesOpen ? <ExpandMoreIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </div>

          {menuAnotacoesOpen && (
            <div className="ml-5 mt-1 space-y-1 border-l border-indigo-700 pl-3 transition-all">
              {categoriasAnotacoes.map((categoria) => {
                const caminho = `/anotacoes/${categoria.id}`;
                const isActive = pathname === caminho;
                return (
                  <Link key={categoria.id} href={caminho}>
                    <div className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer text-sm flex items-center gap-3 ${isActive ? "bg-indigo-600/60 text-white shadow-inner" : "text-indigo-300 hover:bg-indigo-800 hover:text-white"}`}>
                      {categoria.nome}
                    </div>
                  </Link>
                );
              })}

              <Link href="/nova-categoria">
                <div className="px-4 py-2.5 rounded-lg transition-all cursor-pointer text-sm flex items-center gap-3 text-indigo-400 hover:text-indigo-200 opacity-70 hover:opacity-100 border border-dashed border-indigo-700 mt-2">
                  <AddCircleOutlineIcon fontSize="small" /> Nova Categoria
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-indigo-800 text-center text-xs text-indigo-500 font-medium tracking-wide">
        Versão 2.0
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleMobile} className="bg-white text-indigo-900 p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-100">
          <MenuIcon />
        </button>
      </div>

      <aside className="hidden md:flex w-72 flex-col h-screen shrink-0 z-40 relative">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" onClick={toggleMobile}></div>
          <aside className="relative w-72 max-w-[80vw] flex-col h-screen z-50 shadow-2xl animate-slide-right">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}