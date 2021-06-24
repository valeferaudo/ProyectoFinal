import { SportCenterService } from "../interfaces/sportCenterService.interface";
import { Schedule } from "./schedule.model";

export class SportCenter{
    constructor(
           public name: string,
           public address: string,
           public phone: string,
           public aditionalElectricityHour: string,
           public aditionalElectricity: number,
           public mercadoPago: boolean,
           public coords?:{
                latitude?:number,
                longitude?:number
           },
           public deletedDate?: any,
           public services?: SportCenterService[],
           public images?: any [],
           public state?: boolean,
           public id?: string,
           public schedules?: Schedule[]
        ){}

}