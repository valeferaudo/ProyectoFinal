import { Routes } from '@angular/router';
 import { HomeComponent } from './home/home.component';
 import { UsersComponent } from './users/users.component';
 import { AppointmentsComponent } from './appointments/appointments.component';
 import { FieldsComponent } from './fields/fields.component';
 import { AboutComponent } from '../shared/about/about.component';
 import { UserGuard } from '../guards/user.guard';
 import { DoAppointmentComponent } from './do-appointment/do-appointment.component';
import { FaqComponent } from '../shared/faq/faq.component';
import { SportCentersComponent } from './sport-centers/sport-centers.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { PaymentsComponent } from './payments/payments.component';
import { SearchComponent } from './search/search.component';


export const PagesRoutes: Routes = [
   // {path: '', pathMatch: 'full', redirectTo: 'home'},
   // {path: 'home', component: HomeComponent, canActivate: [UserGuard]},
   {path: 'home', component: HomeComponent, canActivate: [UserGuard]},
   {path: 'settings/:id', component: UsersComponent,  canActivate: [UserGuard]},
   {path: 'faq', component: FaqComponent,  canActivate: [UserGuard]},
   {path: 'fields', component: FieldsComponent, canActivate: [UserGuard]},
   {path: 'fields/:id', component: FieldsComponent, canActivate: [UserGuard]},
   {path: 'sportCenters', component: SportCentersComponent,  canActivate: [UserGuard]},
   {path: 'search', component: SearchComponent, canActivate: [UserGuard]},
   {path: 'favorites', component: FavoritesComponent,  canActivate: [UserGuard]},
   {path: 'payments', component: PaymentsComponent,  canActivate: [UserGuard]},
   {path: 'appointments', component: AppointmentsComponent, canActivate: [UserGuard]},
   {path: 'appointment/:id', component: DoAppointmentComponent, canActivate: [UserGuard]},
];


