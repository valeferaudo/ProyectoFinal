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
import { InitialHomeComponent } from './initial-home/initial-home.component';
import { FaqComponent } from './faq/faq.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';





@NgModule({
  declarations: [
    PageNotFoundComponent,
    NavbarComponent,
    FooterComponent,
    AdminNavbarComponent,
    SidebarComponent,
    InitialHomeComponent,
    FaqComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule
  ],
  exports:[
    PageNotFoundComponent,
    NavbarComponent,
    FooterComponent,
    AdminNavbarComponent,
    SidebarComponent,
    InitialHomeComponent,
    FaqComponent
  ]
})
export class SharedModule { }
