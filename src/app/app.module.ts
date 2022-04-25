import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { AccesoComponent } from './pages/acceso/acceso.component';
import { HeaderComponent } from './includes/header/header.component';
import { FooterComponent } from './includes/footer/footer.component';
import {NgxTypedJsModule} from 'ngx-typed-js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdministradoresComponent } from './pages/personal/administradores/administradores.component';
import { DataTablesModule } from 'angular-datatables';
import { SupervisoresComponent } from './pages/personal/supervisores/supervisores.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AccesoComponent,
    HeaderComponent,
    FooterComponent,
    AdministradoresComponent,
    SupervisoresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxTypedJsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
