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
import { PromotoresComponent } from './pages/personal/promotores/promotores.component';
import { ClientesComponent } from './pages/personal/clientes/clientes.component';
import { PrestamosComponent } from './pages/gestion/prestamos/prestamos.component';
import { CrudPrestamosComponent } from './pages/gestion/crud-prestamos/crud-prestamos.component';
import { AbonosComponent } from './pages/gestion/abonos/abonos.component';
import { CrudAbonosComponent } from './pages/gestion/crud-abonos/crud-abonos.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';

registerLocaleData(localeEsMx);


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AccesoComponent,
    HeaderComponent,
    FooterComponent,
    AdministradoresComponent,
    SupervisoresComponent,
    PromotoresComponent,
    ClientesComponent,
    PrestamosComponent,
    CrudPrestamosComponent,
    AbonosComponent,
    CrudAbonosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxTypedJsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
