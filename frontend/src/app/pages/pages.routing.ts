import { Routes } from '@angular/router';
 import { HomeComponent } from './home/home.component';
 import { UsersComponent } from './users/users.component';
 import { AppointmentsComponent } from './appointments/appointments.component';
 import { FieldsComponent } from './fields/fields.component';
 import { AboutComponent } from '../shared/about/about.component';
 import { UserGuard } from '../guards/user.guard';
 import { DoAppointmentComponent } from './do-appointment/do-appointment.component';
import { FaqComponent } from '../shared/faq/faq.component';


export const PagesRoutes: Routes = [
   // {path: '', pathMatch: 'full', redirectTo: 'home'},
   // {path: 'home', component: HomeComponent, canActivate: [UserGuard]},
   {path: '', component: HomeComponent, canActivate: [UserGuard]},
   {path: 'user/:id', component: UsersComponent,  canActivate: [UserGuard]},
   {path: 'faq', component: FaqComponent,  canActivate: [UserGuard]},
   {path: 'fields', component: FieldsComponent,  canActivate: [UserGuard]},
   {path: 'appointments', component: AppointmentsComponent, canActivate: [UserGuard]},
   {path: 'appointment/:id', component: DoAppointmentComponent, canActivate: [UserGuard]},
];


