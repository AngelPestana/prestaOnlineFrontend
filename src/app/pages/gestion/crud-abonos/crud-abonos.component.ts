import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Abono } from 'src/app/models/Abono';
import { Prestamo } from 'src/app/models/Prestamo';
import { AbonoService } from 'src/app/services/abono.service';
import { PrestamoService } from 'src/app/services/prestamo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crud-abonos',
  templateUrl: './crud-abonos.component.html',
  styleUrls: ['./crud-abonos.component.css']
})
export class CrudAbonosComponent implements OnInit {
  id: string = '';
  dtOptions: DataTables.Settings = {};
  abono: Abono[] = [];
  prestamos: Prestamo[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  prestamosGetSubscription: Subscription;
  abonoGetSubscription: Subscription;
  abonoPutSubscription: Subscription;
  abonoPostSubscription: Subscription;
  abonoDeteleSubscription: Subscription;
  formulario: any;
  minimoPagado = 100;
  maximoPagado = 5000;
  //atributos para almacenar el valor de los input almacenados, ya que el formulario reactivo no los almacena cuandos estos son disabled
  atributoCantidadAbonar = 0;
  atributoCambio = 0;
  atributoClienteDebia = 0;
  atributoClienteDebe = 0;
  idPrestamo = '';
  atributoIdCliente = '';
  atributoIdPromotor = '';

  constructor(private router: Router, private ar: ActivatedRoute, private ps: PrestamoService, private as: AbonoService) { }

  ngOnInit(): void {
    this.id = this.ar.snapshot.paramMap.get('id');
    this.checarFechaHoy();
    this.formularioReactivo();
    //console.log(this.id);
    if (this.id != null) {
      //entro en gestion del abono
      this.mostrarValores();
    }
    this.espere();
    this.iniciarTabla();
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
    this.obtenerPrestamos();
  }

  obtenerPrestamos() {
    this.prestamosGetSubscription = this.ps.getPrestamos().subscribe((res: any) => {
      this.prestamos = res;
      //console.log(res);
      this.dtTrigger.next(0);
      this.cerrarLoading();
    }, (error => {
      //console.log(error);
      this.cerrarLoading();
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError2(mensajeError);
    }));
  }

  mensajeError2(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: mensaje,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.router.navigate(['/abonos']);//Para que me rediriga a la pagina de abonos
      }
    })
  }

  someClickHandler(info: any): void {
    let id_prestamo = info[0];
    let supervisor = info[1];
    let id_promotor = info[4];
    let id_cliente = info[6];
    let cliente = info[5];
    let cantidadAbonar = parseFloat(info[7]);
    let clienteDebe = parseFloat(info[8]);
    this.formulario.patchValue({
      Supervisor: supervisor,
      Cliente: cliente,
      cantidad_abonar: cantidadAbonar,
      debia: clienteDebe
    });
    this.idPrestamo = id_prestamo;
    this.atributoIdCliente = id_cliente;
    this.atributoIdPromotor = id_promotor;
    this.atributoCantidadAbonar = cantidadAbonar;
    this.atributoClienteDebia = clienteDebe;
  }

  checarFechaHoy(): string {
    //Para obtener la fecha de hoy y hacerlo ver directamente desde el min y max del input
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let fechaHoy = "";
    if (day < 10 && month < 10) {
      return fechaHoy = `${year}-0${month}-0${day}`;
    } else if (day < 10) {
      return fechaHoy = `${year}-${month}-0${day}`;
    } else if (month < 10) {
      return fechaHoy = `${year}-0${month}-${day}`;
    } else {
      return fechaHoy = `${year}-${month}-${day}`;
    }
  }

  formularioReactivo(): void {
    this.formulario = new FormGroup({
      Cliente: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      Supervisor: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      fecha_abono: new FormControl('', [
        Validators.required
      ]),
      cantidad_abonar: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      total_pagado: new FormControl('', [
        Validators.required,
        Validators.pattern("[0-9]{3,4}")
      ]),
      cambio: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      debia: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      ahora_debe: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ])
    });
  }

  mostrarValores() {
    this.abonoGetSubscription = this.as.getAbono(this.id).subscribe((res: any) => {
      this.abono = res;
      this.presentandoDatos();
      //console.log(res);
    }, (error: any) => {
      //console.log(error);
      //Este es para que el supervisor no acceda a otros prestamos de los otros supervisores
      this.cerrarLoading();
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError(mensajeError);
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      Cliente: this.abono['Cliente'],
      Supervisor: this.abono['Supervisor'],
      fecha_abono: this.abono['fecha_abono'],
      cantidad_abonar: parseFloat(this.abono['cantidad_abonar']),
      total_pagado: parseFloat(this.abono['total_pagado']),
      cambio: parseFloat(this.abono['cambio']),
      debia: parseFloat(this.abono['debia']),
      ahora_debe: parseFloat(this.abono['ahora_debe'])
    });
    //console.log(this.prestamo);
    this.idPrestamo = this.abono['id_prestamo'];
    this.atributoCantidadAbonar = parseFloat(this.abono['cantidad_abonar']);
    this.atributoCambio = parseFloat(this.abono['cambio']);
    this.atributoClienteDebia = parseFloat(this.abono['debia']);
    this.atributoClienteDebe = parseFloat(this.abono['ahora_debe']);
  }

  cerrarLoading() {
    setTimeout(() => {//para detener el loading
      //console.log(this.loading);
      this.mensajeEspere.close();
    }, 500);
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

  mensajeError(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: mensaje,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.router.navigate(['/abonos']);//Para que me rediriga a la tabla abonos
      }
    })
  }

  cambiarValorIdPrestamo(id_prestamo: string) {
    this.idPrestamo = id_prestamo;
    //this.atributoClienteDebia = 
  }

  esDelAbono(id_prestamo: string): string {
    //console.log(id_cliente);
    if (this.abono['id_prestamo'] == id_prestamo) {
      return "checked";
    } else {
      return "";
    }
  }

  cambio() {
    let total_pagado = parseFloat(this.formulario.value.total_pagado);
    let cantidad_abonar = this.atributoCantidadAbonar;
    //console.log(total_pagado);
    //console.log(cantidad_abonar);
    if (total_pagado != NaN && cantidad_abonar != 0) {
      let cambio = total_pagado - cantidad_abonar;
      this.formulario.patchValue({
        cambio: cambio
      });
      this.atributoCambio = cambio;
    }
  }

  clienteAhoraDebe() {
    let cliente_debia = this.atributoClienteDebia;
    let cantidad_abonar = this.atributoCantidadAbonar;
    //console.log(cliente_debia);
    //console.log(cantidad_abonar);
    if (cliente_debia != 0 && cantidad_abonar != 0) {
      let ahoraDebe = cliente_debia - cantidad_abonar;
      this.formulario.patchValue({
        ahora_debe: ahoraDebe
      });
      this.atributoClienteDebe = ahoraDebe;
    }
  }

  agregarAbono() {
    this.espere();
    let abono = new Abono();//Creamos una variable local de tipo administrador, no usamos el this.administrador
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
    abono.id_prestamo = this.idPrestamo;
    abono.id_cliente = this.atributoIdCliente;
    abono.id_promotor = this.atributoIdPromotor;
    abono.fecha_abono = this.formulario.value.fecha_abono;
    abono.cantidad_abonar = this.atributoCantidadAbonar;
    abono.total_pagado = this.formulario.value.total_pagado;
    abono.cambio = this.atributoCambio;
    abono.debia = this.atributoClienteDebia;
    abono.ahora_debe = this.atributoClienteDebe;
    //console.log(abono);
    //console.log(this.prestamo['id']);
    this.abonoPostSubscription = this.as.postAbono(abono).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se agregó el abono con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError(mensajeError);
    });

  }

  mensajeExito(mensaje: string) {
    Swal.fire({
      icon: 'success',
      title: mensaje,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.router.navigate(['/abonos']);//Para que me rediriga a la tabla prestamos
      }
    })
  }

  editarAbono() {
    this.espere();
    let abono = new Abono();//Creamos una variable local de tipo administrador, no usamos el this.administrador
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
    abono.id_prestamo = this.idPrestamo;
    abono.id_cliente = this.atributoIdCliente;
    abono.id_promotor = this.atributoIdPromotor;
    abono.fecha_abono = this.formulario.value.fecha_abono;
    abono.cantidad_abonar = this.atributoCantidadAbonar;
    abono.total_pagado = this.formulario.value.total_pagado;
    abono.cambio = this.atributoCambio;
    abono.debia = this.atributoClienteDebia;
    abono.ahora_debe = this.atributoClienteDebe;
    //console.log(abono);
    //console.log(this.abono['id']);
    this.abonoPutSubscription = this.as.putAbono(abono, this.abono['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se editó el abono con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError(mensajeError);
    });
  }

  eliminarAbono() {
    this.espere();
    //console.log('con que quieres eliminar verdad prro!!');
    this.abonoDeteleSubscription = this.as.deleteAbono(this.abono['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se eliminó el abono con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      //console.log(error);
      let mensajeError = error.error.messages.error;//no es necesario eliminar etiquetas ya que el metodo delete del api
      //no devuelve mensajes con etiquetas
      this.mensajeError(mensajeError);
    });
  }

}
