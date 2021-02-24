import { SweetAlertIcon } from "sweetalert2";

export class ConfirmationSwal{
    constructor(
        public title : string,
        public text: string,
        public icon: SweetAlertIcon
        ){}
}