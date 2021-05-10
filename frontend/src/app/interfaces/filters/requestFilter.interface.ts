export interface RequestFilter{
    text?: string;
    section?: '' |'CARACTERÍSTICA' | 'DEPORTE' | 'SERVICIO';
    state?: '' | 'Aceptada' | 'Rechazada' | 'En pausa';
    seen?: '' | 'Vista' | 'No vista';
}
