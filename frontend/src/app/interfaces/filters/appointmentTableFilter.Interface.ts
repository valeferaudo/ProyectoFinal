export interface AppointmentTableFilter{
    state: null | 'Reserved' | 'AboutToStart' |'InProgress' |'Completed';
    sinceDate?: any;
    untilDate?: any;
    sinceHour?: any;
    untilHour?: any;
    fieldID?: string;
    payment?: null | 'Total' | 'Parcial' | 'Sin Pagos';
}
