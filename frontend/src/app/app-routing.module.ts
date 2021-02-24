import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//MODULOS

//COMPONENTES
import { PagesComponent } from './pages/pages.component';
import { AdminLoginComponent } from './admin/admin-auth/admin-login/admin-login.component';
import { AdminRegisterComponent } from './admin/admin-auth/admin-register/admin-register.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

//RUTAS
import { PagesRoutes } from './pages/pages.routing';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { AdminRoutes } from './admin/admin.routing';

const routes: Routes = [
  {path: '', component: PagesComponent, children: PagesRoutes},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'admin/login', component: AdminLoginComponent},
  {path: 'admin/register', component: AdminRegisterComponent},
  {path: 'admin', component: AdminComponent, children: AdminRoutes },
  {path: '**', component: PageNotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
