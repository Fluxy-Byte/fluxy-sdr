import { prisma } from '../../lib/prisma'


async function verificandoExistencia(phoneNumberId: string) {
    return await prisma.waba.findFirst({
        where: {
            phoneNumberId,
        },
        include: {
            agent: true,
        },
    })
}


async function criarWaba(
    phoneNumberId: string,
    displayPhoneNumber: string,
) {
    return await prisma.waba.create({
        data: {
            phoneNumberId,
            displayPhoneNumber,
            organizationId: 1,
            agentId: 1,
        },
        include: {
            agent: true,
        },
    })
}



export async function waba(phone_number_id: string, display_phone_number: string) {
    try {
        let waba = await verificandoExistencia(phone_number_id);

        if (!waba) {
            waba = await criarWaba(phone_number_id, display_phone_number);
        }

        return {
            status: true,
            waba
        };

    } catch (e) {
        console.error('Erro ao gerar waba:', e);

        return {
            status: false,
            waba: undefined
        };
    }
}
