import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  prestamo: Prestamo[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  prestamosGetSubscription: Subscription;
  prestamoGetSubscription: Subscription;
  id_rol = '';
  formulario: any;

  constructor(private ps: PrestamoService, private router: Router) { }

  ngOnInit(): void {
    this.formularioReactivo();
    this.id_rol = localStorage.getItem('id_rol');
    this.iniciarTabla();
  }

  formularioReactivo(): void {
    this.formulario = new FormGroup({
      Supervisor: new FormControl(),
      Promotor: new FormControl(),
      Cliente: new FormControl(),
      Estado: new FormControl(),
      fecha_inicio_prestamo: new FormControl(),
      fecha_final_prestamo: new FormControl(),
      plazo: new FormControl(),
      cantidad_abonar_mes: new FormControl(),
      monto_prestado: new FormControl(),
      porcentaje_interes: new FormControl(),
      deuda_interes: new FormControl(),
      cliente_debe: new FormControl(),
      created_at: new FormControl()
    });
    //console.log(this.formulario);
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
      imageUrl: 'assets/img/gif/loading.gif',
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

  verPrestamo(id_prestamo : string) {
    this.formulario.reset();//vaciamos el formulario
    this.espere();
    this.prestamoGetSubscription = this.ps.getPrestamo(id_prestamo).subscribe((res: any) => {
      //console.log(res);
      this.prestamo = res;
      this.presentandoDatos();
      //this.formulario.setValue(res);
      //this.cerrarLoading();
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      Supervisor: this.prestamo['Supervisor'],
      Promotor: this.prestamo['Promotor'],
      Cliente: this.prestamo['Cliente'],
      Estado: this.prestamo['Estado'],
      fecha_inicio_prestamo: this.prestamo['fecha_inicio_prestamo'],
      fecha_final_prestamo: this.prestamo['fecha_final_prestamo'],
      plazo: this.prestamo['plazo'],
      cantidad_abonar_mes: this.prestamo['cantidad_abonar_mes'],
      monto_prestado: this.prestamo['monto_prestado'],
      porcentaje_interes: this.prestamo['porcentaje_interes'],
      deuda_interes: this.prestamo['deuda_interes'],
      cliente_debe: this.prestamo['cliente_debe'],
      created_at: this.prestamo['created_at']
    });
    this.cerrarLoading();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.prestamosGetSubscription.unsubscribe();

    if (this.prestamoGetSubscription != null || this.prestamoGetSubscription != undefined) {
      this.prestamoGetSubscription.unsubscribe();
      //console.log('se elimino el get edit')
    }
  }

}
