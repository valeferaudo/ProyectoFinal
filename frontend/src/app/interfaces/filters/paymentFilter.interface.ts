export interface PaymentFilter{
    state: null | 'Aprobado' | 'Pendiente';
    type?: null | 'Efectivo' | 'Mercado Pago' | 'Otro';
    sincePaymentDate?: any;
    untilPaymentDate?: any;
    sinceAppointmentDate?: any;
    untilAppointmentDate?: any;
    fieldID?: string;
}
