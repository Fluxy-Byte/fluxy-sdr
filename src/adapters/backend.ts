import axios from "axios";


export interface Task {
    name_template: string,
    dados: LeadRegister,
    phoneNumberId: string
}

export interface LeadRegister {
    nome: string,
    email?: string,
    produto?: string,
    contexto?: string,
    tomLead?: string,
    urgenciaLead?: string,
    instrucao?: string,
    telefone: string,
    nomeAgente: string,
    telefoneAgente: string,
    problema?: string,
    etapa?: string,
}


export interface Metadata {
    display_phone_number: string
    phone_number_id: string
}


export async function enviarDadosDoCliente(dados: Task) {
    try {

        const url = process.env.ROTA_BACK_END ?? "https://fluxy-agente.egnehl.easypanel.host";
        const { data, status } = await axios.post(`${url}/api/v1/vendas`,
            dados
        );

        console.log(data);
        return status ? true : false;
    } catch (e: any) {
        console.log(e)
        return false;
    }
}


export async function enviarDadosDoRegistroDeLead(phone: string, name: string, metadado: Metadata, context: string) {
    try {

        const url = process.env.ROTA_BACK_END ?? "https://fluxy-agente.egnehl.easypanel.host";
        const { data, status } = await axios.post(`${url}/api/v1/contact`,
            { phone, name, metadado, context }
        );

        console.log(data);
        return status ? true : false;
    } catch (e: any) {
        console.log(e)
        return false;
    }
}


export async function enviarDadosDaAtualizacaoDeNome(phone: string, name: string, metadado: Metadata) {
    try {

        const url = process.env.ROTA_BACK_END ?? "https://fluxy-agente.egnehl.easypanel.host";
        const { data, status } = await axios.put(`${url}/api/v1/contact`,
            { phone, name, metadado }
        );

        console.log(data);
        return status ? true : false;
    } catch (e: any) {
        console.log(e)
        return false;
    }
}
