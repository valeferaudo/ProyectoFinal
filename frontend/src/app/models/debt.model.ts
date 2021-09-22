import { Field } from "./field.model";
import { SportCenter } from "./sportCenter.model";
import { User } from "./user.model";

export class Debt{
    constructor(
           public id?: string,
           public closeDate?: Date,
           public centerApprove?: boolean,
           public userApprove?: boolean,
           public payments?: [],
           public field?: Field,
           public owner?: {
               name?: string,
               oid?: string,
               phone?: number,
           },
           public sportCenter?: SportCenter,
           public createdDate?: Date,
           public totalDebt?: number,
           public description?: string,
           public cancelDescription?: string,
           public cancelDoer?: 'USER' | 'SPORTCENTER',
           public user?: User,
           public appointment?: Date

        ){}

}
