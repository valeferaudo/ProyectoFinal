export interface AppointmentTableFilter{
    stateReserved?:0 | 1,
    stateAboutToStart?: 0 | 1,
    stateInProgress?: 0 | 1,
    stateCompleted?: 0 | 1,
    sinceDate?: any;
    untilDate?: any;
    sinceHour?: any;
    untilHour?: any;
    fieldID?: string;
}
