import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Prestamo } from 'src/app/models/Prestamo';
import { PrestamoService } from 'src/app/services/prestamo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css']
})
export class PrestamosComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  prestamos: Prestamo[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  prestamosGetSubscription: Subscription;

  constructor(private ps: PrestamoService, private router: Router) { }

  ngOnInit(): void {
    if (this.borroLocalStorage()) {//Si borro el localstorage
      this.router.navigate(['/acceso']);//entonces que redireccione al login
    } else {//si no, entonces se queda en la pagina y
      //que haga lo que tenga que hacer
      this.iniciarTabla();
    }
  }

  iniciarTabla() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
      }
    };
    this.obtenerPrestamos();
  }

  obtenerPrestamos() {
    this.espere();
    this.prestamosGetSubscription = this.ps.getPrestamos().subscribe((res: any) => {
      this.prestamos = res;
      //console.log(this.prestamos);
      //console.log(res);
      this.dtTrigger.next(0);
      this.cerrarLoading();
    }, (error => {
      //console.log(error);
      this.cerrarLoading();
    }));
  }

  colorEstado(estado: string): string {

    if (estado == 'Aprobado')
      return 'text-success';
    else if (estado == 'Pendiente')
      return 'text-warning';
    else if (estado == 'Cancelado')
      return 'text-danger';
    else if (estado == 'Finalizado')
      return 'text-secondary';
    //console.log('1');
    return '';
  }

  espere() {
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

  borroLocalStorage(): boolean {
    //console.log(localStorage.getItem('accedio'));
    if (localStorage.getItem('token') == null || localStorage.getItem('token') == undefined) {
      return true;
      //this.router.navigate(['/acceso']);
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.prestamosGetSubscription.unsubscribe();
  }

}
