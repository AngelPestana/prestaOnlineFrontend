import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Administrador } from 'src/app/models/Administrador';
import { AdministradorService } from 'src/app/services/administrador.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administradores',
  templateUrl: './administradores.component.html',
  styleUrls: ['./administradores.component.css']
})
export class AdministradoresComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  administradores: Administrador[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;

  constructor(private as: AdministradorService) { }

  ngOnInit(): void {
    this.espere();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
      }
    };
    this.obtenerAdministradores();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  obtenerAdministradores() {
    this.as.getAdministradores().subscribe((res: any) => {
      this.administradores = res;
      console.log(res);
      this.dtTrigger.next(0);
      this.cerrarLoading();
    }, (error => {
      console.log(error);
      this.cerrarLoading();
    }));
  }

  mensajeErrorIniciarSesion(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: mensaje
    })
  }

  espere () {
    this.mensajeEspere = Swal.fire({
      title: 'Por favor espere...',
      imageUrl: '../../../assets/img/gif/loading.gif',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Custom image',
      showConfirmButton: false,
      allowOutsideClick: false
    });
  }

  cerrarLoading() {
    setTimeout(() => {//para detener el loading
      //console.log(this.loading);
      this.mensajeEspere.close();
    }, 500);
  }
}
