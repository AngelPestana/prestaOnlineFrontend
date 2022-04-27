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
  fecha_inicio: string = "";
  fecha_final: Date = new Date();
  fecha_final2: string = "";
  fechaHoy: string = "";
  plazo: number = 0;
  abono_mes: number = 0;
  deuda_interes: number = 0;
  montoPrestado: number = 0;
  intereses: number = 0;

  constructor(private cs: ClienteService, private ps: PromotorService, private ps2: PrestamoService, private router: Router, private ar: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.ar.snapshot.paramMap.get('id');
    this.checarFechaHoy();
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

  checarFechaHoy() {
    //Para obtener la fecha de hoy y hacerlo ver directamente desde el min y max del input
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (day < 10 && month < 10) {
      this.fechaHoy = `${year}-0${month}-0${day}`;
    } else if (day < 10) {
      this.fechaHoy = `${year}-${month}-0${day}`;
    } else if (month < 10) {
      //console.log(`${day}-0${month}-${year}`);
      this.fechaHoy = `${year}-0${month}-${day}`;
    } else {
      //console.log(`${day}-${month}-${year}`);
      this.fechaHoy = `${year}-${month}-${day}`;
    }
  }

  fechaFinal() {
    //new Date (this.fechaInicio);
    //this.fechaInicio.setMonth(this.fechaInicio.getMonth() + this.plazo);
    //Nota importante, a huevo necesito del setDate :v
    //console.log(this.fecha_inicio);
    this.fecha_final = new Date(this.fecha_inicio);
    //console.log(this.fecha_final);
    let month = this.fecha_final.getMonth();
    //console.log(month);
    let day = this.fecha_final.getDate();
    this.fecha_final.setMonth(month + this.plazo);
    this.fecha_final.setDate(day + 1);
    //console.log(this.fecha_final);
    this.fecha_final2 = this.convertirFechaAString(this.fecha_final);
    //console.log(this.fecha_final2);
  }

  convertirFechaAString(fecha: Date): string {
    let day = fecha.getDate();
    let month = fecha.getMonth() + 1;
    let year = fecha.getFullYear();
    let fechaString = "";
    if (day < 10 && month < 10) {
      fechaString = `${year}-0${month}-0${day}`;
    } else if (day < 10) {
      fechaString = `${year}-${month}-0${day}`;
    } else if (month < 10) {
      //console.log(`${day}-0${month}-${year}`);
      fechaString = `${year}-0${month}-${day}`;
    } else {
      //console.log(`${day}-${month}-${year}`);
      fechaString = `${year}-${month}-${day}`;
    }
    return fechaString;
  }

  deudaInteres() {
    let porcentaje = this.intereses / 100;
    let calcularInteres = this.montoPrestado * porcentaje;
    this.deuda_interes = this.montoPrestado + calcularInteres;
  }

  abonosMes() {
    let abonoSinRedondeo = this.deuda_interes / this.plazo;
    this.abono_mes = Math.round(abonoSinRedondeo);
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

  someClickHandler(info: any): void {
    let message = info[0] + ' - ' + info[1];
    console.log(message);
  }

  iniciarTabla() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
      },
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)
        // Note: In newer jQuery v3 versions, `unbind` and `bind` are 
        // deprecated in favor of `off` and `on`
        $('input', row).off('click');
        $('input', row).on('click', () => {
          self.someClickHandler(data);
        });
        return row;
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
