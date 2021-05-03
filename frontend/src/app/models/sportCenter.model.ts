export class SportCenter{
    constructor(
           public name: string,
           public address: string,
           public phone: string,
           public aditionalElectricityHour: string,
           public aditionalElectricity: number,
           public mercadoPago: boolean,
           public deletedDate?: any,
           public images?: any [],
           public state?: boolean,
           public id?: string,
        ){}

}