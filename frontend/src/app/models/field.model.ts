import { Feature } from "./feature.model";

export class Field{
    constructor(
           public name: string,
           public description: string,
           public sizes?: string,
           public duration?: number,
           public price?: number,
           public features?: Feature [],
           public image?: string,
           public id?: string,
           public sportCenter?: string,
           public cantMaxPlayers?: number,
           public openingHour?: Date,
           public closingHour?: Date,
        ){}

}
