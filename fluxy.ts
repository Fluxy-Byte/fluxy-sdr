import 'dotenv/config';

import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';
import { enviarDadosDaAtualizacaoDeNome, enviarDadosDoRegistroDeLead } from './src/adapters/backend';
import { error } from './src/services/tools/error';
import { sendClienteToAgenteHuman } from './src/services/tools/sendClienteToAgenteHuman';

/* ======================================================
   TYPES
====================================================== */

type SessionContext = any;


/* ======================================================
   REGISTER LEAD TOOL
====================================================== */

export const registerLead = new FunctionTool({
  name: 'register_lead',
  description: 'Registra um lead B2B qualificado produtos da Cardoso Motos',
  parameters: z.object({
    nome: z.string().min(2, 'Nome inválido'),
    contexto: z.string().min(10, 'Contexto insuficiente'),
    tomLead: z.enum([
      'curioso',
      'engajado',
      'analitico',
      'decisor',
      'cetico'
    ]),

    urgenciaLead: z.enum([
      'Baixa',
      'Média',
      'Alta'
    ]),

    instrucao: z.string().min(10, 'Instrução incompleta')
  }),

  execute: async (params, toolContext: SessionContext) => {
    try {
      const {
        nome,
        contexto,
        tomLead,
        urgenciaLead,
        instrucao
      } = params;

      const session = toolContext?.invocationContext?.session;

      const telefoneLead = session?.id ?? JSON.stringify(session);

      /* ===============================
         LOG ESTRUTURADO
      =============================== */

      console.log('[NEW LEAD]', {
        nome,
        contexto,
        tomLead,
        urgenciaLead,
        instrucao
      });

      /* ===============================
         PAYLOAD
      =============================== */

      const dados = {
        nome,
        produto: contexto,
        tomLead,
        urgenciaLead,
        instrucao,

        telefone: telefoneLead,

        nomeAgente:
          process.env.NOME_AGENTE_VENDAS ?? 'Agente Gamefic',

        telefoneAgente:
          process.env.NUMBER_VENDAS ?? '5534997801829'
      };

      const metaDados = {
        display_phone_number: "553491713923",
        phone_number_id: "872884792582393"
      }
      
      await enviarDadosDoRegistroDeLead(telefoneLead, nome, metaDados, contexto);

      await sendClienteToAgenteHuman(dados);

      return {
        status: 'success',
        message:
          'Obrigado pelo contato. Seu atendimento será continuado por um especialista.'
      };

    } catch (err) {
      console.error('[REGISTER ERROR]', err);

      return {
        status: 'error',
        message:
          'Falha ao registrar lead. Tente novamente.'
      };
    }
  }
});



export const registerNameLead = new FunctionTool({
  name: 'register_name_lead',
  description: 'Registra o nome capturado do lead para o time comercial',

  parameters: z.object({
    nome: z.string().min(2, 'Nome inválido')
  }),

  execute: async (params, toolContext: SessionContext) => {
    try {
      const {
        nome
      } = params;

      const session = toolContext?.invocationContext?.session;

      const telefoneLead = session?.id ?? JSON.stringify(session);

      /* ===============================
         LOG ESTRUTURADO
      =============================== */

      console.log('[Atualizado nome do Lead]', {
        nome
      });

      /* ===============================
         PAYLOAD
      =============================== */

      const metaDados = {
        display_phone_number: "553491713923",
        phone_number_id: "872884792582393"
      }
      await enviarDadosDaAtualizacaoDeNome(telefoneLead, nome, metaDados);

      return {
        status: 'success',
        message:
          `Contato atualizado com sucesso. O nome do lead é ${nome}.`
      };

    } catch (err) {
      console.error('[REGISTER ERROR]', err);

      return {
        status: 'error',
        message:
          'Falha ao registrar nome do lead. Tente novamente.'
      };
    }
  }
});


export const errorLead = new FunctionTool({
  name: 'error_lead',
  description: 'Registra problemas técnicos do cliente',

  parameters: z.object({
    nome: z.string().min(2),

    problema: z.string().min(5),

    etapa: z.enum([
      'login',
      'plataforma',
      'pagamento',
      'acesso',
      'outro'
    ])
  }),

  execute: async (params, toolContext: SessionContext) => {
    try {
      const { nome, problema, etapa } = params;

      const session = toolContext?.invocationContext?.session

      const telefoneLead = session?.id ?? JSON.stringify(session);

      const dados = {
        nome,
        problema,
        etapa,
        telefone: telefoneLead,
        nomeAgente:
          process.env.NOME_AGENTE_SUPORTE ?? 'Suporte Cardoso',

        telefoneAgente:
          process.env.NUMBER_SUPORTE ?? '5534997801829'
      };

      const metaDados = {
        display_phone_number: "553491713923",
        phone_number_id: "872884792582393"
      }

      await enviarDadosDoRegistroDeLead(telefoneLead, nome, metaDados, problema);

      console.log('[SUPPORT]', dados);

      await error(dados);



      return {
        status: 'success',
        message:
          `Obrigado, ${nome}. Nosso suporte já recebeu sua solicitação.`
      };

    } catch (err) {
      console.error('[SUPPORT ERROR]', err);

      return {
        status: 'error',
        message:
          'Erro ao registrar suporte.'
      };
    }
  }
});


/* ======================================================
   ROOT AGENT
====================================================== */

export const rootAgent = new LlmAgent({
  name: 'sales_agent_fluxy',

  model: 'gemini-2.5-flash',

  instruction: `
# PERSONA: O CARDOZINHO DA CARDOSO MOTOS
Você é o Cardozinho, consultor da Cardoso Motos. Seu estilo é "parceiro", desenrolado e focado em resolver a vida do cliente. Você fala a língua de quem anda de moto, sem formalidade excessiva, mas com total profissionalismo.

# MISSÃO SECRETA (REGISTRO DE LEAD)
Sempre que notar real intenção de compra, você deve conduzir a conversa para extrair estes pontos, sem parecer um formulário:
1. NOME: Como o cliente se chama.
2. CONTEXTO: O que ele faz (ex: entregador, lazer, transporte pro trabalho).
3. TOM DO LEAD: Identifique se ele é Curioso, Engajado, Analítico, Decisor ou Cético.
4. URGÊNCIA: Identifique se é Baixa, Média ou Alta.

# DIRETRIZES DE ESCRITA
- Use frases curtas e quebras de linha (estilo WhatsApp).
- Jamais use listas numeradas.
- Use emojis com moderação: 🏍️, 👊, ✅, 🚀.
- Se não souber algo: "Vou conferir no pátio e te falo, um segundo!"

# EXEMPLOS DE ABORDAGEM DO CARDOZINHO

## Capturando Contexto e Problema:
"Show de bola! Mas me diz aí, hoje você tá precisando da moto mais pro corre do trabalho ou pra passear no fim de semana? É pra fugir do trânsito ou sua atual tá te dando dor de cabeça?"

## Capturando Objetivo e Urgência:
"Entendi... e você tem pressa pra montar nela? Se a gente fechar um negócio bom, você já quer sair acelerando essa semana ainda?"

# INSTRUÇÃO PARA O TIME COMERCIAL (GERAÇÃO DE RELATÓRIO)
Ao final da interação, ou quando o cliente demonstrar que quer avançar, você deve organizar internamente os dados neste formato para o comercial:

- nome: [Nome do Cliente]
- contexto: [Breve descrição do uso da moto e setor]
- tomLead: [Curioso, Engajado, Analítico, Decisor ou Cético]
- urgenciaLead: [Baixa, Média ou Alta]
- instrucao: [Dica para o vendedor: ex: "Ele tá focado em parcelas baixas, dê ênfase no financiamento" ou "Ele quer potência, foque na cilindrada".]

# REGRAS E RESTRIÇÕES
1. NUNCA diga que é uma IA.
2. NÃO invente preços. Site: https://cardosomoto.com.br/
3. O relatório final é para uso INTERNO, não envie para o cliente.
`,

  tools: [registerLead, registerNameLead, errorLead]
});

/* ======================================================
   START COMMANDS

   npx adk web
   npx adk api_server
====================================================== */
