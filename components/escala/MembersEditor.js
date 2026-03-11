"use client";

import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import EditNoteIcon from '@mui/icons-material/EditNote'; 

export default function MembersEditor({ membros, setMembros }) {
  const [novoMembro, setNovoMembro] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [valorEdicao, setValorEdicao] = useState("");

  const adicionarMembro = () => {
    if (novoMembro.trim() && !membros.includes(novoMembro.trim())) {
      setMembros([...membros, novoMembro.trim()]);
      setNovoMembro("");
    }
  };

  const removerMembro = (indexParaRemover) => {
    setMembros(membros.filter((_, index) => index !== indexParaRemover));
  };

  const iniciarEdicao = (index, nome) => {
    setEditandoIndex(index);
    setValorEdicao(nome);
  };

  const salvarEdicao = (index) => {
    if (valorEdicao.trim() && !membros.includes(valorEdicao.trim())) {
      const novaLista = [...membros];
      novaLista[index] = valorEdicao.trim();
      setMembros(novaLista);
    }
    setEditandoIndex(null);
  };

  return (
    <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Membros da Escala</h3>
      
      {/* Input para Adicionar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={novoMembro}
          onChange={(e) => setNovoMembro(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionarMembro()}
          placeholder="Nome do novo membro..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={adicionarMembro}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      {/* Lista de Membros */}
      <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {membros.length === 0 ? (
          <p className="text-xs text-gray-400 text-center italic">Nenhum membro adicionado.</p>
        ) : (
          membros.map((membro, index) => (
            <li key={index} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
              {editandoIndex === index ? (
                <input
                  type="text"
                  value={valorEdicao}
                  onChange={(e) => setValorEdicao(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(index)}
                  className="flex-1 px-2 py-1 border-b-2 border-indigo-500 focus:outline-none text-sm mr-2"
                  autoFocus
                />
              ) : (
                <span className="text-sm text-gray-700 font-medium pl-1">{membro}</span>
              )}

              <div className="flex gap-1">
                {editandoIndex === index ? (
                  <button onClick={() => salvarEdicao(index)} className="text-green-500 hover:text-green-700 p-1">
                    <CheckIcon fontSize="small" />
                  </button>
                ) : (
                  <button onClick={() => iniciarEdicao(index, membro)} className="text-blue-400 hover:text-blue-600 p-1">
                    <EditIcon fontSize="small" />
                  </button>
                )}
                <button onClick={() => removerMembro(index)} className="text-red-400 hover:text-red-600 p-1">
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}