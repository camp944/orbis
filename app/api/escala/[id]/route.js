import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function getEscala(id) {
    const fileData = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileData);
    const escala = data.escalas.find(e => e.id === id);
    return { data, escala, idsDisponiveis: data.escalas.map(e => e.id) };
}

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const idBuscado = resolvedParams.id;
        
        console.log("-----------------------------------------");
        console.log("1. Backend recebeu pedido para o ID:", idBuscado);

        const { escala, idsDisponiveis } = await getEscala(idBuscado);
        
        console.log("2. IDs que existem no data.json:", idsDisponiveis);

        if (!escala) {
            console.log("3. RESULTADO: ID não bateu! Retornando 404.");
            console.log("-----------------------------------------");
            return Response.json({ error: `Escala '${idBuscado}' não encontrada!` }, { status: 404 });
        }
        
        console.log("3. RESULTADO: Sucesso! Devolvendo escala.");
        console.log("-----------------------------------------");
        return Response.json(escala);
        
    } catch (error) {
        console.error("ERRO GRAVE:", error);
        return Response.json({ error: "Falha ao ler o banco de dados." }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const resolvedParams = await params;
        const idEscala = resolvedParams.id;
        const body = await request.json();
        const { acao, ignorados = [], pessoaConfirmada } = body;

        const { data, escala } = await getEscala(idEscala);
        if (!escala) return Response.json({ error: "Escala não encontrada!" }, { status: 404 });

        const hoje = new Date();
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const parts = formatter.formatToParts(hoje);
        const getPart = (type) => parts.find(p => p.type === type).value;
        const dataFormatada = `${getPart('day')}/${getPart('month')}/${getPart('year')}`;
        const dataHoraFormatada = `${dataFormatada} às ${getPart('hour')}:${getPart('minute')}`;
        
        const diaDaSemana = hoje.getDay(); 
        const amanha = (diaDaSemana + 1) % 7;

        if (acao === 'sortear') {
            if (escala.ultimaExecucao && escala.ultimaExecucao.startsWith(dataFormatada)) {
                return Response.json({ error: "O sorteio de hoje já foi feito!" }, { status: 400 });
            }

            let filaAtual = [...escala.fila];
            if (filaAtual.length === 0) filaAtual = [...escala.ok];

            let pendentesDisponiveis = escala.pendentes.filter(p => !ignorados.includes(p));
            let disponiveis = pendentesDisponiveis.length > 0 ? pendentesDisponiveis : filaAtual.filter(p => !ignorados.includes(p));

            if (disponiveis.length === 0) return Response.json({ error: "Não há mais pessoas disponíveis hoje." }, { status: 400 });

            let pessoasProibidasHoje = escala.regras ? escala.regras.filter(r => r.diaProibido === diaDaSemana).map(r => r.pessoa) : [];
            let pessoasProibidasAmanha = escala.regras ? escala.regras.filter(r => r.diaProibido === amanha).map(r => r.pessoa) : [];

            let sorteado = "";
            let forcado = "";
            if (filaAtual.length === 2) {
                let pessoaParaForcar = pessoasProibidasAmanha.find(p => disponiveis.includes(p));
                if (pessoaParaForcar) forcado = pessoaParaForcar;
            }

            if (forcado) sorteado = forcado;
            else {
                let indicesValidos = [];
                disponiveis.forEach((pessoa, i) => { if (!pessoasProibidasHoje.includes(pessoa)) indicesValidos.push(i); });
                if (indicesValidos.length === 0) disponiveis.forEach((_, i) => indicesValidos.push(i));
                sorteado = disponiveis[Math.floor(Math.random() * indicesValidos.length)];
            }

            return Response.json({ pessoa: sorteado, viaPendentes: pendentesDisponiveis.length > 0 });
        }

        if (acao === 'confirmar') {
            if (!pessoaConfirmada) return Response.json({ error: "Pessoa não informada." }, { status: 400 });
            if (escala.fila.length === 0) { escala.fila = [...escala.ok]; escala.ok = []; }

            ignorados.forEach(pessoa => { if (!escala.pendentes.includes(pessoa)) escala.pendentes.push(pessoa); });
            escala.pendentes = escala.pendentes.filter(p => p !== pessoaConfirmada);

            const index = escala.fila.indexOf(pessoaConfirmada);
            if (index > -1) { escala.fila.splice(index, 1); escala.ok.push(pessoaConfirmada); }

            escala.ultimaExecucao = dataHoraFormatada;
            escala.sorteado = pessoaConfirmada;
            if (!escala.historico) escala.historico = [];
            escala.historico.unshift({ data: dataFormatada, nome: pessoaConfirmada });

            const escalaIndex = data.escalas.findIndex(e => e.id === idEscala);
            data.escalas[escalaIndex] = escala;

            await fs.writeFile(dataFilePath, JSON.stringify(data, null, 4));
            return Response.json({ message: "Sorteio consolidado com sucesso!", data: escala });
        }

        if (acao === 'editar_membros') {
            const { novosMembros } = body;
            
            // Junta todos os membros atuais para saber quem já estava no sistema
            const membrosAtuais = [...escala.fila, ...escala.ok, ...escala.pendentes];
            
            // Descobre quem entrou e quem saiu
            const removidos = membrosAtuais.filter(m => !novosMembros.includes(m));
            const adicionados = novosMembros.filter(m => !membrosAtuais.includes(m));

            // Limpa os removidos de todas as listas
            escala.fila = escala.fila.filter(m => !removidos.includes(m));
            escala.ok = escala.ok.filter(m => !removidos.includes(m));
            escala.pendentes = escala.pendentes.filter(m => !removidos.includes(m));
            escala.regras = escala.regras.filter(r => !removidos.includes(r.pessoa));

            // Os adicionados vão direto para a lista base (fila)
            escala.fila.push(...adicionados);

            const escalaIndex = data.escalas.findIndex(e => e.id === idEscala);
            data.escalas[escalaIndex] = escala;

            await fs.writeFile(dataFilePath, JSON.stringify(data, null, 4));
            return Response.json({ message: "Membros atualizados!", data: escala });
        }
    } catch (error) {
        return Response.json({ error: "Erro interno no servidor." }, { status: 500 });
    }
}