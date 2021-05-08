export class Request{
    constructor(
           public section: any,
           public description: string,
           public sportCenter?: string,
           public creatorEmail?: string,
           public date?: string,
           public state?: boolean,
           public seen?: boolean,
           public id?: string,

        ){}

}
