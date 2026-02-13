import { prisma } from '../../lib/prisma'
import { waba } from './waba'

export interface Metadata {
    display_phone_number: string
    phone_number_id: string
}

export interface Contato {
    id: number;
    email: string | null;
    name: string | null;
    phone: string;
    start_date_conversation: Date;
    last_date_conversation: Date | null;
    pipeline_user: string;
}

async function verificandoExistencia(phone: string) {
    return await prisma.contact.findFirst({
        where: {
            phone
        }
    })
}

async function updateDateLastMessage(phone: string, context: string) {
    await prisma.contact.update({
        where: {
            phone: phone
        },
        data: {
            lastDateConversation: new Date(),
            leadGoal: context
        }
    });
}


async function criarUsuario(phone: string, name: string, idTemp: number, context: string) {
    console.log(phone, name, idTemp, context)
    return await prisma.contact.create({
        data: {
            phone,
            name,
            wabaId: idTemp,
            leadGoal: context
        }
    })
}

export async function contato(phone: string, name: string, metadado: Metadata, context: string) {
    try {
        console.log("2")
        console.log(context)
        let dadosWaba = (await waba(metadado.phone_number_id, metadado.display_phone_number)).waba

        let user = await verificandoExistencia(phone);

        if (!user) {
            let idTemp = dadosWaba?.id ?? 1
            user = await criarUsuario(phone, name, idTemp, context);
        }

        updateDateLastMessage(phone, context);

        return {
            status: true,
            user
        };

    } catch (e) {
        console.error('Erro ao gerar usuário:', e);

        return {
            status: false,
            user: null
        };
    }
}


export async function getAllContacts() {
    return await prisma.contact.findMany();
}

export async function updateNameLead(phone: string, name: string, metadado: Metadata) {
    try {
        console.log("1")
        let dadosWaba = (await waba(metadado.phone_number_id, metadado.display_phone_number)).waba

        let user = await verificandoExistencia(phone);

        if (!user) {
            let idTemp = dadosWaba?.id ?? 1
            user = await criarUsuario(phone, name, idTemp, "Objetivo não foi informado");
        }

        return {
            status: true,
            user
        };

    } catch (e) {
        console.error('Erro ao gerar usuário:', e);

        return {
            status: false,
            user: null
        };
    }
}