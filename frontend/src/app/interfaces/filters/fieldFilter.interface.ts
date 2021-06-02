export interface FieldFilter{
    text?: string;
    state?: '' | 'Activo' | 'Bloqueado';
    sportCenterID?: string;
    features?: any[];
    sports?: any[];
    sincePrice?: any;
    untilPrice?: any;
    sinceHour?: any;
    untilHour?: any;
}
