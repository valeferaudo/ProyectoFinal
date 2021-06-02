export interface SportCenterFilter{
    text?: string;
    state?: '' | 'Activo' | 'Bloqueado';
    services?: any[];
    sports?: any[];
    sinceHour?: any;
    untilHour?: any;
}
