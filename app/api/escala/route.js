import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

// NOVO: Método GET para listar todas as escalas na Sidebar
export async function GET() {
    try {
        const fileData = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileData);
        
        // Retorna apenas o ID e o Nome para montar o menu
        const listaEscalas = data.escalas.map(e => ({ id: e.id, nome: e.nome }));
        return Response.json(listaEscalas);
    } catch (error) {
        return Response.json({ error: "Erro ao ler as escalas." }, { status: 500 });
    }
}

// O seu método POST de criação de escala continua intacto aqui
export async function POST(request) {
    try {
        const body = await request.json();
        const { nome, membros } = body;

        if (!nome || !membros || membros.length === 0) {
            return Response.json({ error: "Nome e membros são obrigatórios." }, { status: 400 });
        }

        const fileData = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileData);

        let novoId = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        
        if (data.escalas.find(e => e.id === novoId)) {
            novoId = `${novoId}-${Date.now().toString().slice(-4)}`;
        }

        const novaEscala = {
            id: novoId,
            nome: nome,
            fila: membros,
            ok: [],
            pendentes: [],
            historico: [],
            ultimaExecucao: "",
            sorteado: "",
            regras: []
        };

        data.escalas.push(novaEscala);
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 4));

        return Response.json({ message: "Escala criada com sucesso!", id: novoId });
    } catch (error) {
        return Response.json({ error: "Erro ao criar escala." }, { status: 500 });
    }
}