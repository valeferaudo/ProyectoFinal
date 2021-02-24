import { Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-pages/admin-home/admin-home.component';
import {AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminAppointmentsComponent } from './admin-pages/admin-appointments/admin-appointments.component';
import { AdminSettingComponent } from './admin-pages/admin-setting/admin-setting.component';
import { AdminFieldComponent } from './admin-pages/admin-field/admin-field.component';
import { AdminFieldsComponent } from './admin-pages/admin-fields/admin-fields.component';
import { AdminDoAppointmentsComponent } from './admin-pages/admin-do-appointments/admin-do-appointments.component';

export const AdminRoutes: Routes = [
     {path: '', pathMatch: 'full', redirectTo: 'home'},
     {path: 'home', component: AdminHomeComponent, canActivate: [AdminAuthGuard]},
     {path: 'settings', component: AdminSettingComponent, canActivate: [AdminAuthGuard]},
     {path: 'field', component: AdminFieldComponent, canActivate: [AdminAuthGuard]},
     {path: 'field/:id', component: AdminFieldComponent, canActivate: [AdminAuthGuard]},
     {path: 'fields', component: AdminFieldsComponent, canActivate: [AdminAuthGuard]},
     {path: 'appointments', component: AdminAppointmentsComponent, canActivate: [AdminAuthGuard]},
     {path: 'appointment/:id', component: AdminDoAppointmentsComponent, canActivate: [AdminAuthGuard]},
];


