import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoComponent } from './pages/acceso/acceso.component';
import { HomeComponent } from './pages/home/home.component';
import { AdministradoresComponent } from './pages/personal/administradores/administradores.component';
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
