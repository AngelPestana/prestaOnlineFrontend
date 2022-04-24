import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  nombre: string | null = '';
  id_rol: string | null = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.valores();
  }

  valores() {
    if (localStorage.getItem('token') != null) {
      this.nombre = localStorage.getItem('nombre');
      this.id_rol = localStorage.getItem('id_rol');
    }
  }

  salir() {
    localStorage.clear();
    this.nombre = '';
    this.id_rol = '';
    this.router.navigate(['/acceso']);
    this.mensajeCerroSesion();
  }

  mensajeCerroSesion() {
    Swal.fire({
      title: 'Sesión cerrada, vuelva pronto!',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }

}
