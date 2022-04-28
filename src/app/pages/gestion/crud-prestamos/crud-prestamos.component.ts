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
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-crud-prestamos',
  templateUrl: './crud-prestamos.component.html',
  styleUrls: ['./crud-prestamos.component.css']
})
export class CrudPrestamosComponent implements OnInit {
  id: string = '';
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
  formulario: any;
  minimoMes = 6;
  maximoMes = 24;
  atributoDeudaInteres = 0;
  radioPromotor = 0;
  idPromotor = '';
  idCliente = '';

  constructor(private cs: ClienteService, private ps: PromotorService, private ps2: PrestamoService, private router: Router, private ar: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.ar.snapshot.paramMap.get('id');
    this.checarFechaHoy();
    this.formularioReactivo();
    //console.log(this.id);
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

  checarFechaHoy(): string {
    //Para obtener la fecha de hoy y hacerlo ver directamente desde el min y max del input
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let fechaHoy = "";
    if (day < 10 && month < 10) {
      //console.log(fechaHoy);
      return fechaHoy = `${year}-0${month}-0${day}`;
    } else if (day < 10) {
      //console.log(this.fechaHoy);
      return fechaHoy = `${year}-${month}-0${day}`;
    } else if (month < 10) {
      //console.log(`${day}-0${month}-${year}`);
      //console.log(this.fechaHoy);
      return fechaHoy = `${year}-0${month}-${day}`;
    } else {
      //console.log(`${day}-${month}-${year}`);
      //console.log(this.fechaHoy);
      return fechaHoy = `${year}-${month}-${day}`;
    }
    
  }

  fechaFinal() {
    let fecha_inicio = this.formulario.value.fecha_inicio_prestamo;
    let plazo = this.formulario.value.plazo;
    let fecha_final = new Date(fecha_inicio);
    let month = fecha_final.getMonth();
    let day = fecha_final.getDate();
    fecha_final.setMonth(month + plazo);
    fecha_final.setDate(day + 1);
    let fecha_final2 = this.convertirFechaAString(fecha_final);
    this.formulario.patchValue({
      fecha_final_prestamo: fecha_final2
    });
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
      fechaString = `${year}-0${month}-${day}`;
    } else {
      fechaString = `${year}-${month}-${day}`;
    }
    return fechaString;
  }

  formularioReactivo(): void {
    this.formulario = new FormGroup({
      Cliente: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      Promotor: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      fecha_inicio_prestamo: new FormControl('', [
        Validators.required
      ]),
      fecha_final_prestamo: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      plazo: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(2),
        Validators.pattern("[0-9]{1,2}")
      ]),
      cantidad_abonar_mes: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      monto_prestado: new FormControl('', [
        Validators.required
      ]),
      intereses: new FormControl('', [
        Validators.required
      ]),
      deuda_interes: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ])
    });
  }

  deudaInteres() {
    let intereses = this.formulario.value.intereses;
    let monto_prestado = this.formulario.value.monto_prestado;
    let porcentaje = intereses / 100;
    let calcularInteres = monto_prestado * porcentaje;
    let deuda_interes = monto_prestado + calcularInteres;
    this.atributoDeudaInteres = deuda_interes;
    this.formulario.patchValue({
      deuda_interes: deuda_interes
    });
  }

  abonosMes() {
    let deuda_interes = this.atributoDeudaInteres;
    let plazo = this.formulario.value.plazo;
    console.log(deuda_interes);
    console.log(plazo);
    let abonoSinRedondeo = deuda_interes / plazo;
    let abono_mes = Math.round(abonoSinRedondeo);
    this.formulario.patchValue({
      cantidad_abonar_mes: abono_mes
    });
  }

  cambiarValorIdPromotor(idPromotor: string) {
    this.idPromotor = idPromotor;
    //console.log(this.idPromotor);
  }

  cambiarValorIdCliente(idCliente: string) {
    this.idCliente = idCliente;
    //console.log(this.idPromotor);
  }

  mostrarValores() {
    this.ps2.getPrestamo(this.id).subscribe((res: any) => {
      this.prestamo = res;
      this.presentandoDatos();
      //console.log(res);
    }, (error: any) => {
      //console.log(error);
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      Cliente: this.prestamo['Cliente'],
      Promotor: this.prestamo['Promotor'],
      fecha_inicio_prestamo: this.prestamo['fecha_inicio_prestamo'],
      fecha_final_prestamo: this.prestamo['fecha_final_prestamo'],
      plazo: this.prestamo['plazo'],
      cantidad_abonar_mes: this.prestamo['cantidad_abonar_mes'],
      monto_prestado: this.prestamo['monto_prestado'],
      intereses: this.prestamo['porcentaje_interes'],
      deuda_interes: this.prestamo['deuda_interes']
    });
    this.idPromotor = this.prestamo['id_promotor'];
    console.log(this.formulario);
    //this.formulario.id_cliente.fireUncheck();
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
    //console.log(id_cliente);
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

  get formularioControl() {//NO borrar
    return this.formulario.controls;
  }

}
