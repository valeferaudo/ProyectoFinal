import { Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-pages/admin-home/admin-home.component';
import { AdminAppointmentsComponent } from './admin-pages/admin-appointments/admin-appointments.component';
import { AdminSettingComponent } from './admin-pages/admin-setting/admin-setting.component';
import { AdminFieldsComponent } from './admin-pages/admin-fields/admin-fields.component';
import { AdminDoAppointmentsComponent } from './admin-pages/admin-do-appointments/admin-do-appointments.component';
import { UsersComponent } from './super-admin-pages/users/users.component';
//GUARDS
//Solo 'SUPER-ADMIN'
import { SuperAdminGuard } from '../guards/super-admin.guard';
//Solo 'CENTER-SUPER-ADMIN'
import {CenterSuperAdminGuard } from '../guards/centerSuperAdmin.guard';
//Todos
import { AdminGuard } from '../guards/admin.guard';
//Solo 'CENTER-SUPER-ADMIN' Y 'CENTER-ADMIN'
import { CenterGuard } from '../guards/center.guard';
import { SportsComponent } from './super-admin-pages/sports/sports.component';
import { ServicesComponent } from './super-admin-pages/services/services.component';
import { FeaturesComponent } from './super-admin-pages/features/features.component';
import { SportCentersComponent } from './super-admin-pages/sport-centers/sport-centers.component';
import { SportCenterComponent } from './admin-pages/sport-center/sport-center.component';
import { HomeGuard } from '../guards/home.guard';
import { AdminRequestsComponent } from './admin-pages/admin-requests/admin-requests.component';
import { RequestDoComponent } from './super-admin-pages/request-do/request-do.component';
import { AdminUsersComponent } from './admin-pages/admin-users/admin-users.component';
import { AdminReportsComponent } from './admin-pages/admin-reports/admin-reports.component';
import { UserSettingComponent } from '../components/user-setting/user-setting.component';



export const AdminRoutes: Routes = [
     // {path: '', pathMatch: 'full', redirectTo: 'home'},
     // {path: 'home', component: AdminHomeComponent, canActivate: [HomeGuard]},
     {path: '', component: AdminHomeComponent, canActivate: [HomeGuard]},
     {path: 'settings', component: AdminSettingComponent, canActivate: [CenterGuard]},
     {path: 'fields', component: AdminFieldsComponent, canActivate: [AdminGuard]},
     {path: 'appointments', component: AdminAppointmentsComponent, canActivate: [CenterGuard]},
     {path: 'appointment', component: AdminDoAppointmentsComponent, canActivate: [CenterGuard]},
     {path: 'appointment/:id', component: AdminDoAppointmentsComponent, canActivate: [CenterGuard]},
     {path: 'users', component: AdminUsersComponent, canActivate: [CenterSuperAdminGuard]},
     {path: 'user/:id', component: UserSettingComponent, canActivate: [CenterGuard]},
     {path: 'sportcenter/:id', component: SportCenterComponent, canActivate: [CenterGuard]},
     {path: 'requests', component: AdminRequestsComponent, canActivate: [CenterSuperAdminGuard]},
     {path: 'reports', component: AdminReportsComponent, canActivate: [CenterSuperAdminGuard]},
     
     //rutas del SUPER-ADMIN
     {path: 'super/users', component: UsersComponent, canActivate: [SuperAdminGuard]},
     {path: 'super/sports', component: SportsComponent, canActivate: [SuperAdminGuard]},
     {path: 'super/services', component: ServicesComponent, canActivate: [SuperAdminGuard]},
     {path: 'super/features', component: FeaturesComponent, canActivate: [SuperAdminGuard]},
     {path: 'super/sportcenter/:id', component: SportCenterComponent, canActivate: [SuperAdminGuard]},
     {path: 'super/sportcenters', component: SportCentersComponent, canActivate: [SuperAdminGuard]},
     {path: 'super/requests', component: RequestDoComponent, canActivate: [SuperAdminGuard]},

];


