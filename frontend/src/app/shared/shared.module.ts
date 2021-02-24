import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Modules
import { RouterModule } from '@angular/router';

//Components
 import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';





@NgModule({
  declarations: [
    PageNotFoundComponent,
    NavbarComponent,
    FooterComponent,
    AdminNavbarComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    PageNotFoundComponent,
    NavbarComponent,
    FooterComponent,
    AdminNavbarComponent,
    SidebarComponent
  ]
})
export class SharedModule { }
