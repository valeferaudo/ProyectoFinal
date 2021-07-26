export interface SportCenterFilter{
    text?: string;
    state?: '' | 'Activo' | 'Bloqueado';
    services?: any[];
    days?: any[];
    sports?: any[];
    sinceHour?: any;
    untilHour?: any;
    available?: boolean;
}
