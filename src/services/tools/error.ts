import 'dotenv/config';
import { enviarDadosDoCliente, LeadRegister } from "../../adapters/backend"

export const error = async (dados: LeadRegister) => {
    try {
        await enviarDadosDoCliente({
            name_template: "error_lead",
            dados,
            "phoneNumberId": "872884792582393"
        });
        return true;
    } catch (e: any) {
        console.log(e)
        return false;
    }
}