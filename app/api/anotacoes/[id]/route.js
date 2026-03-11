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

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const data = await getAnotacoesDB();
        const categoria = data.categorias.find(c => c.id === resolvedParams.id);
        
        if (!categoria) return Response.json({ error: "Categoria não encontrada." }, { status: 404 });

        // Garante que o array de tags exista mesmo nas categorias antigas
        if (!categoria.tagsDisponiveis) categoria.tagsDisponiveis = [];
        
        categoria.anotacoes.sort((a, b) => new Date(b.dataRegistroIso) - new Date(a.dataRegistroIso));
        return Response.json(categoria);
    } catch (error) {
        return Response.json({ error: "Erro interno." }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const resolvedParams = await params;
        const idCategoria = resolvedParams.id;
        const body = await request.json();
        const { acao, nota, tag, tagId } = body; // Adicionado suporte para tags
        
        const data = await getAnotacoesDB();
        const catIndex = data.categorias.findIndex(c => c.id === idCategoria);
        
        if (catIndex === -1) return Response.json({ error: "Categoria não encontrada." }, { status: 404 });
        if (!data.categorias[catIndex].tagsDisponiveis) data.categorias[catIndex].tagsDisponiveis = [];

        /// --- GERENCIAMENTO DE TAGS ---
        if (acao === 'criar_tag') {
            const novaTag = { ...tag, id: `tag-${Date.now()}` };
            data.categorias[catIndex].tagsDisponiveis.push(novaTag);
            await fs.writeFile(anotacoesFilePath, JSON.stringify(data, null, 4));
            return Response.json({ message: "Tag criada!", tagsDisponiveis: data.categorias[catIndex].tagsDisponiveis });
        }
        if (acao === 'editar_tag') { // NOVO BLOCO DE EDIÇÃO
            const index = data.categorias[catIndex].tagsDisponiveis.findIndex(t => t.id === tag.id);
            if (index > -1) {
                data.categorias[catIndex].tagsDisponiveis[index] = { ...data.categorias[catIndex].tagsDisponiveis[index], ...tag };
                await fs.writeFile(anotacoesFilePath, JSON.stringify(data, null, 4));
                return Response.json({ message: "Tag editada!", tagsDisponiveis: data.categorias[catIndex].tagsDisponiveis });
            }
            return Response.json({ error: "Tag não encontrada." }, { status: 404 });
        }
        if (acao === 'deletar_tag') {
            data.categorias[catIndex].tagsDisponiveis = data.categorias[catIndex].tagsDisponiveis.filter(t => t.id !== tagId);
            await fs.writeFile(anotacoesFilePath, JSON.stringify(data, null, 4));
            return Response.json({ message: "Tag removida!", tagsDisponiveis: data.categorias[catIndex].tagsDisponiveis });
        }

        // --- GERENCIAMENTO DE NOTAS ---
        const hoje = new Date();
        const dataIso = hoje.toISOString();
        const formatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const parts = formatter.formatToParts(hoje);
        const getPart = (type) => parts.find(p => p.type === type).value;
        const dataFormatada = `${getPart('day')}/${getPart('month')}/${getPart('year')} às ${getPart('hour')}:${getPart('minute')}`;

        if (acao === 'criar') {
            data.categorias[catIndex].anotacoes.unshift({
                id: `nota-${Date.now()}`,
                titulo: nota.titulo || "Sem Título",
                conteudo: nota.conteudo || "",
                importante: nota.importante || false,
                dataLembrete: nota.dataLembrete || null,
                tags: nota.tags || [], // Salva as tags selecionadas
                dataRegistro: dataFormatada,
                dataRegistroIso: dataIso
            });
        } 
        else if (acao === 'atualizar') {
            const index = data.categorias[catIndex].anotacoes.findIndex(n => n.id === nota.id);
            if (index > -1) {
                data.categorias[catIndex].anotacoes[index] = { ...data.categorias[catIndex].anotacoes[index], ...nota };
            }
        }
        else if (acao === 'deletar') {
            data.categorias[catIndex].anotacoes = data.categorias[catIndex].anotacoes.filter(n => n.id !== nota.id);
        }

        await fs.writeFile(anotacoesFilePath, JSON.stringify(data, null, 4));
        const anotacoesOrdenadas = data.categorias[catIndex].anotacoes.sort((a, b) => new Date(b.dataRegistroIso) - new Date(a.dataRegistroIso));
        
        return Response.json({ message: "Sucesso!", anotacoes: anotacoesOrdenadas });
    } catch (error) {
        return Response.json({ error: "Erro ao processar." }, { status: 500 });
    }
}