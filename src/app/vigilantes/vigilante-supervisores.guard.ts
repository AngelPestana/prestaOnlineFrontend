import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VigilanteSupervisoresGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (localStorage.getItem('token') != null || localStorage.getItem('nombre') != null || localStorage.getItem('id_rol') != null || localStorage.getItem('tiempoExpirado') != null) {
      if (localStorage.getItem('id_rol') == '2') {
        return true;
      }else {
        this.redireccionarInicio();
        return false;
      }
    }else {
      localStorage.clear();//que limpie todo y que el usuario vuelva a acceder
      this.redireccionarAcceso();
      return false;
    }
  }

  redireccionarAcceso() {
    this.router.navigate(['/acceso']);
  }

  redireccionarInicio() {
    this.router.navigate(['/home']);
  }
  
}
