import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoComponent } from './pages/acceso/acceso.component';
import { CrudPrestamosComponent } from './pages/gestion/crud-prestamos/crud-prestamos.component';
import { PrestamosComponent } from './pages/gestion/prestamos/prestamos.component';
import { HomeComponent } from './pages/home/home.component';
import { AdministradoresComponent } from './pages/personal/administradores/administradores.component';
import { ClientesComponent } from './pages/personal/clientes/clientes.component';
import { PromotoresComponent } from './pages/personal/promotores/promotores.component';
import { SupervisoresComponent } from './pages/personal/supervisores/supervisores.component';
import { VigilanteAccedioGuard } from './vigilantes/vigilante-accedio.guard';
import { VigilanteAdministradoresSupervisoresPromotoresGuard } from './vigilantes/vigilante-administradores-supervisores-promotores.guard';
import { VigilanteAdministradoresSupervisoresGuard } from './vigilantes/vigilante-administradores-supervisores.guard';
import { VigilanteAdministradoresGuard } from './vigilantes/vigilante-administradores.guard';
import { VigilanteSupervisoresGuard } from './vigilantes/vigilante-supervisores.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'acceso',
    component: AccesoComponent
  },
  {
    path: 'administradores',
    component: AdministradoresComponent,
    canActivate: [VigilanteAdministradoresGuard]
  },
  {
    path: 'supervisores',
    component: SupervisoresComponent,
    canActivate: [VigilanteAdministradoresGuard]
  },
  {
    path: 'promotores',
    component: PromotoresComponent,
    canActivate: [VigilanteAdministradoresSupervisoresGuard]
  },
  {
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [VigilanteAdministradoresSupervisoresPromotoresGuard]
  },
  {
    path: 'prestamos',
    component: PrestamosComponent,
    canActivate: [VigilanteAccedioGuard]
  },
  {
    path: 'crud-prestamos',
    component: CrudPrestamosComponent,
    canActivate: [VigilanteSupervisoresGuard]
  },
  {
    path: 'crud-prestamos/:id',
    component: CrudPrestamosComponent,
    canActivate: [VigilanteAdministradoresSupervisoresGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
