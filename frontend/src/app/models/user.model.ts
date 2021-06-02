import { environment } from 'src/environments/environment';
import { SportCenter } from './sportCenter.model';

const base_url = environment.base_url;

export class User{
    constructor(
        public name: string,
        public lastName: string,
        public address: string,
        public phone: number,
        public email: string,
        public password?: string,
        public role?: 'USER' | 'SUPER-ADMIN' | 'CENTER-SUPER-ADMIN' | 'CENTER-ADMIN',
        public uid?: string,
        public favorites?: any [],
        public sportCenter?: SportCenter
        ){}

    /*Feature for user's image (add image in constructor) use this with the instance
    get imageURL(){
        if (this.image.includes('http')){
            return this.image;
        }
        if(this.image){
            return `${base_url}/uploads/user/${this.image}`
        }
        else{
            return `${base_url}/uploads/no-image.png`
        }
    }*/
}
