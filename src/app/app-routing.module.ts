import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoComponent } from './pages/acceso/acceso.component';
import { HomeComponent } from './pages/home/home.component';
import { AdministradoresComponent } from './pages/personal/administradores/administradores.component';
import { ClientesComponent } from './pages/personal/clientes/clientes.component';
import { PromotoresComponent } from './pages/personal/promotores/promotores.component';
import { SupervisoresComponent } from './pages/personal/supervisores/supervisores.component';

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
    component: AdministradoresComponent
  },
  {
    path: 'supervisores',
    component: SupervisoresComponent
  },
  {
    path: 'promotores',
    component: PromotoresComponent
  },
  {
    path: 'clientes',
    component: ClientesComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
