import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Cliente } from 'src/app/models/Cliente';
import Swal from 'sweetalert2';
import { ClienteService } from '../../../services/cliente.service';
import { PromotorService } from 'src/app/services/promotor.service';
import { Promotor } from 'src/app/models/Promotor';
import { PrestamoService } from 'src/app/services/prestamo.service';
import { Prestamo } from 'src/app/models/Prestamo';

@Component({
  selector: 'app-crud-prestamos',
  templateUrl: './crud-prestamos.component.html',
  styleUrls: ['./crud-prestamos.component.css']
})
export class CrudPrestamosComponent implements OnInit {
  id: string = "";
  dtOptions: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  prestamo: Prestamo[] = [];
  clientes: Cliente[] = [];
  promotores: Promotor[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  clientesGetSubscription: Subscription;
  promotoresGetSubscription: Subscription;

  constructor(private cs: ClienteService, private ps: PromotorService, private ps2: PrestamoService, private router: Router, private ar: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.ar.snapshot.paramMap.get('id');
    //console.log(id);
    if (this.id != null) {
      //entro en gestion del prestamos
      this.mostrarValores();
    }
    if (this.borroLocalStorage()) {//Si borro el localstorage
      this.router.navigate(['/acceso']);//entonces que redireccione al login
    } else {//si no, entonces se queda en la pagina y
      //que haga lo que tenga que hacer
      this.espere();
      this.iniciarTabla();
      this.iniciarTabla2();
    }
  }

  mostrarValores() {
    this.ps2.getPrestamo(this.id).subscribe((res: any) => {
      this.prestamo = res;
      //console.log(res);
    }, (error: any) => {
      //console.log(error);
    });
  }

  borroLocalStorage(): boolean {
    //console.log(localStorage.getItem('accedio'));
    if (localStorage.getItem('token') == null || localStorage.getItem('token') == undefined) {
      return true;
      //this.router.navigate(['/acceso']);
    }else{
      return false;
    }
  }

  esDelPrestamo (id_cliente: string): string{
    if (this.prestamo['id_cliente'] == id_cliente){
      return "checked";
    }else{
      return "";
    }
  }

  esDelPrestamo2 (id_promotor: string): string{
    if (this.prestamo['id_promotor'] == id_promotor){
      return "checked";
    }else{
      return "";
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
    this.obtenerClientes();
  }

  iniciarTabla2() {
    this.dtOptions2 = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
      }
    };
    this.obtenerPromotores();
  }

  obtenerPromotores() {
    this.promotoresGetSubscription = this.ps.getPromotores().subscribe((res: any) => {
      this.promotores = res;
      //console.log(res);
      this.dtTrigger2.next(0);
      this.cerrarLoading();
    }, (error => {
      //console.log(error);
      this.cerrarLoading();
    }));
  }

  obtenerClientes() {
    this.clientesGetSubscription = this.cs.getClientes().subscribe((res: any) => {
      this.clientes = res;
      //console.log(res);
      this.dtTrigger.next(0);
    }, (error => {
      //console.log(error);
    }));
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.clientesGetSubscription.unsubscribe();
    this.promotoresGetSubscription.unsubscribe();
  }

}
