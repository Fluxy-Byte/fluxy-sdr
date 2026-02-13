import 'dotenv/config';
import { enviarDadosDoCliente, LeadRegister } from "../../adapters/backend"

export const sendClienteToAgenteHuman = async (dados: LeadRegister) => {
    try {
        await enviarDadosDoCliente({
            name_template: "chegou_mais_um_lead",
            dados,
            "phoneNumberId": "872884792582393"
        });

        return true;
    } catch (e: any) {
        console.log(e)
        return false;
    }
}