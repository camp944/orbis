import { promises as fs } from 'fs';
import path from 'path';

const anotacoesFilePath = path.join(process.cwd(), 'anotacoes.json');

async function getAnotacoesDB() {
    try {
        const fileData = await fs.readFile(anotacoesFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const base = { categorias: [] };
            await fs.writeFile(anotacoesFilePath, JSON.stringify(base, null, 4));
            return base;
        }
        throw error;
    }
}

export async function GET() {
    try {
        const data = await getAnotacoesDB();
        // AGORA RETORNAMOS AS TAGS JUNTO PARA O FRONTEND PODER "EMPRESTAR" ENTRE MURAIS
        const listaCategorias = data.categorias.map(c => ({ 
            id: c.id, 
            nome: c.nome,
            tagsDisponiveis: c.tagsDisponiveis || [] 
        }));
        return Response.json(listaCategorias);
    } catch (error) {
        return Response.json({ error: "Erro ao ler categorias." }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nome } = body;

        if (!nome) return Response.json({ error: "Nome é obrigatório." }, { status: 400 });

        const data = await getAnotacoesDB();

        let novoId = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        if (data.categorias.find(c => c.id === novoId)) novoId = `${novoId}-${Date.now().toString().slice(-4)}`;

        const novaCategoria = {
            id: novoId,
            nome: nome,
            anotacoes: [],
            tagsDisponiveis: [] // NOVO: Toda categoria nasce com espaço para tags
        };

        data.categorias.push(novaCategoria);
        await fs.writeFile(anotacoesFilePath, JSON.stringify(data, null, 4));

        return Response.json({ message: "Categoria criada com sucesso!", id: novoId });
    } catch (error) {
        return Response.json({ error: "Erro ao criar categoria." }, { status: 500 });
    }
}