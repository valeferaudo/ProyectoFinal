export interface UserFilter{
    text: string;
    state: '' | 'Activo' | 'Bloqueado';
    userType: 'SUPER-ADMIN' | 'CENTER-SUPER-ADMIN';
}
