import { Component, OnInit, HostListener } from '@angular/core';
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
import { Capital } from 'src/app/models/Capital';
import { CapitalService } from 'src/app/services/capital.service';
import { DiaFestivoService } from 'src/app/services/dia-festivo.service';
import { Festivo } from 'src/app/models/Festivo';
import { FilaCalendario } from 'src/app/models/FilaCalendario';

@Component({
  selector: 'app-crud-prestamos',
  templateUrl: './crud-prestamos.component.html',
  styleUrls: ['./crud-prestamos.component.css']
})
export class CrudPrestamosComponent implements OnInit {
  id: string = '';
  dtOptions: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  prestamo: Prestamo[] = [];
  clientes: Cliente[] = [];
  promotores: Promotor[] = [];
  capitales: Capital[] = [];
  festivos: Festivo[] = [];//Todos los Festivos
  festivo: Festivo[] = [];//Creo que este no lo voy a ocupar
  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  prestamoGetSubscription: Subscription;
  prestamoPutSubscription: Subscription;
  prestamoPostSubscription: Subscription;
  prestamoDeteleSubscription: Subscription;
  clientesGetSubscription: Subscription;
  promotoresGetSubscription: Subscription;
  capitalesGetSubscription: Subscription;
  festivosGetSubscription: Subscription;
  festivosMap: { [fecha: string]: string } = {};   // 'YYYY-MM-DD' -> descripción // este tipo de objeto es un map donde cada fecha sera un string y su valor asociado sera tambien unu string
  errorFestivos = ''; //variable bandera
  calendario: FilaCalendario[] = [];               // pagos + festivos, para la tarjeta
  pagos: FilaCalendario[] = [];                    // solo pagos reales
  mostrarTarjeta = false;
  formulario: any;
  minimoMes = 6;
  maximoMes = 24;
  minimoMonto = 1000;
  maximoMonto = 50000;
  //atributos para almacenar el valor de los input almacenados, ya que el formulario reactivo no los almacena cuandos estos son disabled
  atributoFechaFinalPrestamo = '';
  atributoDeudaInteres = 0;
  atributoCantidadAbonarMes = 0;
  idPromotor = '';
  idCliente = '';
  idCapital = '';
  fechaMinima: Date = new Date();

  constructor(private cs: ClienteService, private ps: PromotorService, private ps2: PrestamoService, private cap: CapitalService, private router: Router, private ar: ActivatedRoute, private dfs: DiaFestivoService) { }

  ngOnInit(): void {
    this.id = this.ar.snapshot.paramMap.get('id');
    //this.checarFechaHoy();
    this.formularioReactivo();
    //console.log(this.id);
    if (this.id != null) {
      //entro en gestion del prestamos
      this.mostrarValores();
    }
    this.espere();
    this.iniciarTabla();
    this.iniciarTabla2();
    this.iniciarTabla3();
    this.realizarCalculos();
    this.obtenerFestivos();
  }

  /*checarFechaHoy(): Date {
    //Para obtener la fecha de hoy y hacerlo ver directamente desde el min y max del input
    /*let date = new Date();
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
    return new Date();
  }*/

  filtroFecha = (date: Date | null): boolean => {
    if (!date) return false;

    const dia = date.getDay(); // 0 = domingo, 6 = sábado
    return dia !== 0 && dia !== 6;
  };

  mensajeError2(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: mensaje,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
      }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.router.navigate(['/home']);//Para que me rediriga a la pagina de inicio
        }
      })
  }


  /*fechaFinal() {
    const fechaInicio = this.formulario.get('fecha_inicio_prestamo')?.value;
    const plazoDias = Number(this.formulario.get('plazo')?.value);

    if (!fechaInicio || !plazoDias || plazoDias <= 0 || !Number.isInteger(plazoDias)) {
        this.atributoFechaFinalPrestamo = '';

        this.formulario.patchValue({
            fecha_final_prestamo: ''
        }, { emitEvent: false });

        return;
    }

    let fechaActual = new Date(fechaInicio);

    if (isNaN(fechaActual.getTime())) {
        return;
    }

    // Comenzamos a contar desde el día siguiente
    fechaActual.setDate(fechaActual.getDate() + 1);

    let diasContados = 0;

    while (diasContados < plazoDias) {

        const diaSemana = fechaActual.getDay();

        // Excluir sábados y domingos
        if (diaSemana !== 0 && diaSemana !== 6) {
            diasContados++;
        }

        if (diasContados < plazoDias) {
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
    }

    const fechaFinalString = this.convertirFechaAString(fechaActual);

    this.atributoFechaFinalPrestamo = fechaFinalString;

    this.formulario.patchValue({
        fecha_final_prestamo: fechaFinalString
    }, { emitEvent: false });
  }*/

  // Convierte Date o 'YYYY-MM-DD' (con o sin hora) a fecha local, sin desfase de zona horaria
private parsearFecha(valor: any): Date | null {
  if (!valor) { return null; }
  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
  if (m) { return new Date(+m[1], +m[2] - 1, +m[3]); }
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

private crearFila(tipo: 'pago' | 'festivo', fecha: Date, n?: number, descripcion?: string): FilaCalendario {
  const fila = new FilaCalendario();
  fila.tipo = tipo;
  fila.fecha = new Date(fecha);
  fila.n = n;
  fila.descripcion = descripcion;
  return fila;
}

generarCalendario(): void {
  const inicio = this.parsearFecha(this.formulario.get('fecha_inicio_prestamo')?.value);
  const plazo = Number(this.formulario.get('plazo')?.value);

  this.calendario = [];
  this.pagos = [];
  if (!inicio || !Number.isInteger(plazo) || plazo <= 0 || plazo > 365) { return; }

  const fecha = new Date(inicio);
  let numPago = 0;

  while (numPago < plazo) {
    fecha.setDate(fecha.getDate() + 1);              // el primer pago es al día siguiente
    const dia = fecha.getDay();
    if (dia === 0 || dia === 6) { continue; }        // sábado y domingo no aparecen

    const festivo = this.festivosMap[this.formatearFecha(fecha)];
    if (festivo) {                                    // festivo entre semana: fila roja, sin número
      this.calendario.push(this.crearFila('festivo', fecha, undefined, festivo));
      continue;
    }

    numPago++;
    const fila = this.crearFila('pago', fecha, numPago);
    this.calendario.push(fila);
    this.pagos.push(fila);
  }
}

fechaFinal() {
  this.generarCalendario();
  const ultimo = this.ultimoPago;
  const fechaFinalString = (ultimo && ultimo.fecha) ? this.formatearFecha(ultimo.fecha) : '';

  this.atributoFechaFinalPrestamo = fechaFinalString;
  this.formulario.patchValue({ fecha_final_prestamo: fechaFinalString }, { emitEvent: false });
}

get fechaInicio(): Date | null {
  return this.parsearFecha(this.formulario?.get('fecha_inicio_prestamo')?.value);
}

get primerPago(): FilaCalendario | null {
  return this.pagos.length ? this.pagos[0] : null;
}

get ultimoPago(): FilaCalendario | null {
  return this.pagos.length ? this.pagos[this.pagos.length - 1] : null;
}

get festivosEnPeriodo(): number {
  return this.calendario.length - this.pagos.length;
}

abrirTarjeta(): void { this.mostrarTarjeta = true; }
cerrarTarjeta(): void { this.mostrarTarjeta = false; }

@HostListener('document:keydown.escape')
cerrarConEscape(): void { this.mostrarTarjeta = false; }

imprimirTarjeta(): void {
  const tarjeta = document.getElementById('tarjeta-pagos');
  if (!tarjeta) { return; }

  const ventana = window.open('', '_blank', 'width=900,height=1000');
  if (!ventana) {
    Swal.fire({ icon: 'warning', title: 'Permite las ventanas emergentes para poder imprimir', confirmButtonText: 'Aceptar' });
    return;
  }

  // Copiamos los estilos de la página (Bootstrap, etc.) para que se vea igual que en el modal
  const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML)
    .join('');

  ventana.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <base href="${document.baseURI}">
        <title>Tarjeta de pagos</title>
        ${estilos}
        <style>
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: letter; margin: 10mm; }
          body { background: #fff !important; padding: 0 !important; }
          #tarjeta-pagos table td, #tarjeta-pagos table th { padding: 1px 4px; font-size: 11px; }
          #tarjeta-pagos tr { page-break-inside: avoid; }
        </style>
      </head>
      <body>${tarjeta.outerHTML}</body>
    </html>`);
  ventana.document.close();
  ventana.onafterprint = () => ventana.close();
  setTimeout(() => { ventana.focus(); ventana.print(); }, 500);
}

  formatearFecha(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
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
      NombreCapital: new FormControl({
        value: '',
        disabled: true
      }, [
        Validators.required
      ]),
      MontoCapital: new FormControl({
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
      ]),
      id_estado: new FormControl('', [
        Validators.required
      ])
    });
  }

  deudaInteres() {
    const intereses = Number(this.formulario.get('intereses')?.value);
    const montoPrestado = Number(this.formulario.get('monto_prestado')?.value);

    // Evitar cálculos cuando faltan datos
    if (!montoPrestado || !intereses || montoPrestado <= 0) {
        this.atributoDeudaInteres = 0;
        this.atributoCantidadAbonarMes = 0;

        this.formulario.patchValue({
            deuda_interes: '',
            cantidad_abonar_mes: ''
        }, { emitEvent: false });

        return;
    }

    const porcentaje = intereses / 100;
    const deudaInteres = montoPrestado + (montoPrestado * porcentaje);

    this.atributoDeudaInteres = deudaInteres;

    this.formulario.patchValue({
        deuda_interes: deudaInteres
    }, { emitEvent: false });

    // Actualizar automáticamente el abono diario
    this.abonosDia();
  }

  abonosDia() {
    const deudaInteres = this.atributoDeudaInteres;
    const plazo = Number(this.formulario.get('plazo')?.value);

    if (!deudaInteres || !plazo || plazo <= 0) {
        this.atributoCantidadAbonarMes = 0;

        this.formulario.patchValue({
            cantidad_abonar_mes: ''
        }, { emitEvent: false });

        return;
    }

    const abono = deudaInteres / plazo;
    const abonoRedondeado = Math.round(abono * 100) / 100;

    this.atributoCantidadAbonarMes = abonoRedondeado;

    this.formulario.patchValue({
        cantidad_abonar_mes: abonoRedondeado
    }, { emitEvent: false });
  }

  cambiarValorIdPromotor(idPromotor: string) {
    this.idPromotor = idPromotor;
    //console.log(this.idPromotor);
  }

  cambiarValorIdCliente(idCliente: string) {
    this.idCliente = idCliente;
    //console.log(this.idPromotor);
  }

  cambiarValorIdCapital(idCapital: string) {
    this.idCapital = idCapital;
    //console.log(this.idPromotor);
  }

  mostrarValores() {
    this.prestamoGetSubscription = this.ps2.getPrestamo(this.id).subscribe((res: any) => {
      this.prestamo = res;
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
      Cliente: this.prestamo['Cliente'],
      Promotor: this.prestamo['Promotor'],
      Capital: this.prestamo['Capital'],
      fecha_inicio_prestamo: this.prestamo['fecha_inicio_prestamo'],
      fecha_final_prestamo: this.prestamo['fecha_final_prestamo'],
      plazo: parseInt(this.prestamo['plazo']),
      cantidad_abonar_mes: parseFloat(this.prestamo['cantidad_abonar_mes']),
      monto_prestado: parseFloat(this.prestamo['monto_prestado']),
      intereses: parseFloat(this.prestamo['porcentaje_interes']),
      deuda_interes: parseFloat(this.prestamo['deuda_interes']),
      id_estado: parseInt(this.prestamo['id_estado'])
    });
    //console.log(this.prestamo);
    this.idPromotor = this.prestamo['id_promotor'];
    this.idCliente = this.prestamo['id_cliente'];
    this.idCapital = this.prestamo['id_capital'];
    this.atributoFechaFinalPrestamo = this.prestamo['fecha_final_prestamo'];
    this.atributoDeudaInteres = parseFloat(this.prestamo['deuda_interes']);
    this.atributoCantidadAbonarMes = parseFloat(this.prestamo['cantidad_abonar_mes']);
  }

  esDelPrestamo(id_cliente: string): string {
    //console.log(id_cliente);
    if (this.prestamo['id_cliente'] == id_cliente) {
      return "checked";
    } else {
      return "";
    }
  }

  esDelPrestamo2(id_promotor: string): string {
    if (this.prestamo['id_promotor'] == id_promotor) {
      return "checked";
    } else {
      return "";
    }
  }

  esDelPrestamo3(id_capital: string): string {
    if (this.prestamo['id_capital'] == id_capital) {
      return "checked";
    } else {
      return "";
    }
  }

  someClickHandler(info: any): void {
    let message = info[1] + ' ' + info[2];
    this.formulario.patchValue({
      Cliente: message,
    });
    //console.log(message);
  }

  someClickHandler2(info: any): void {
    let message = info[1] + ' ' + info[2];
    this.formulario.patchValue({
      Promotor: message,
    });
    //console.log(message);
  }

  someClickHandler3(info: any): void {
    let message = info[1];
    let message2 = info[2];
    this.formulario.patchValue({
      NombreCapital: message,
      MontoCapital: message2,
    });
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
      },
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)
        // Note: In newer jQuery v3 versions, `unbind` and `bind` are 
        // deprecated in favor of `off` and `on`
        $('input', row).off('click');
        $('input', row).on('click', () => {
          self.someClickHandler2(data);
        });
        return row;
      }
    };
    this.obtenerPromotores();
  }

  iniciarTabla3() {
    this.dtOptions3 = {
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
          self.someClickHandler3(data);
        });
        return row;
      }
    };
    this.obtenerCapitales();
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

  obtenerCapitales() {
    this.capitalesGetSubscription = this.cap.getCapitales().subscribe((res: any) => {
      this.capitales = res;
      //console.log(res);
      this.dtTrigger3.next(0);
      this.cerrarLoading();
    }, (error => {
      //console.log(error);
      this.cerrarLoading();
    }));
  }

  obtenerFestivos() {
  this.festivosGetSubscription = this.dfs.getDiasFestivos().subscribe((res: any) => {
    this.festivos = res;
    this.festivosMap = {};
    this.festivos.forEach((f: Festivo) => {
      const d = this.parsearFecha(f.fecha);
      if (d) {
        this.festivosMap[this.formatearFecha(d)] = f.descripcion || 'Día festivo';
      }
    });
    this.errorFestivos = '';
    this.fechaFinal();   // recalcula por si ya hay fecha y plazo capturados
  }, (error: any) => {
    let mensajeError = 'No se pudieron cargar los días festivos.';
    if (error && error.error && error.error.messages && error.error.messages.error) {
      mensajeError = String(error.error.messages.error).replace(/<[^>]*>?/g, '');
    }
    this.errorFestivos = mensajeError + ' El calendario se calculará sin días festivos.';
  });
  }

  editarPrestamo() {
    this.espere();
    let prestamo = new Prestamo();//Creamos una variable local de tipo administrador, no usamos el this.administrador
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
    prestamo.id_promotor = this.idPromotor;
    prestamo.id_cliente = this.idCliente;
    prestamo.id_capital = this.idCapital;
    prestamo.fecha_final_prestamo = this.atributoFechaFinalPrestamo;
    prestamo.fecha_inicio_prestamo = this.formulario.value.fecha_inicio_prestamo;
    prestamo.plazo = this.formulario.value.plazo;
    prestamo.cantidad_abonar_mes = this.atributoCantidadAbonarMes;
    prestamo.monto_prestado = this.formulario.value.monto_prestado;
    prestamo.porcentaje_interes = this.formulario.value.intereses;
    prestamo.deuda_interes = this.atributoDeudaInteres;
    prestamo.id_estado = this.formulario.value.id_estado
    //console.log(prestamo);
    //console.log(this.prestamo['id']);
    this.prestamoPutSubscription = this.ps2.putPrestamo(prestamo, this.prestamo['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se editó el prestamo con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError(mensajeError);
    });
  }

  agregarPrestamo() {
    this.espere();
    let prestamo = new Prestamo();//Creamos una variable local de tipo administrador, no usamos el this.administrador
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
    prestamo.id_promotor = this.idPromotor;
    prestamo.id_cliente = this.idCliente;
    prestamo.id_capital = this.idCapital;
    prestamo.fecha_final_prestamo = this.atributoFechaFinalPrestamo;
    prestamo.fecha_inicio_prestamo = this.formatearFecha(
      this.formulario.value.fecha_inicio_prestamo
    );
    //prestamo.fecha_inicio_prestamo = this.formulario.value.fecha_inicio_prestamo;
    prestamo.plazo = this.formulario.value.plazo;
    prestamo.cantidad_abonar_mes = this.atributoCantidadAbonarMes;
    prestamo.monto_prestado = this.formulario.value.monto_prestado;
    prestamo.porcentaje_interes = this.formulario.value.intereses;
    prestamo.deuda_interes = this.atributoDeudaInteres;
    prestamo.id_estado = this.formulario.value.id_estado
    //console.log(prestamo);
    //console.log(this.prestamo['id']);

    this.prestamoPostSubscription = this.ps2.postPrestamo(prestamo).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se agregó el prestamo con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError(mensajeError);
    });
  }

  eliminarPrestamo() {
    this.espere();
    //console.log('con que quieres eliminar verdad prro!!');
    this.prestamoDeteleSubscription = this.ps2.deletePrestamo(this.prestamo['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se eliminó el prestamo con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      //console.log(error);
      let mensajeError = error.error.messages.error;//no es necesario eliminar etiquetas ya que el metodo delete del api
      //no devuelve mensajes con etiquetas
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
        this.router.navigate(['/prestamos']);//Para que me rediriga a la tabla prestamos
      }
    })
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
        this.router.navigate(['/prestamos']);//Para que me rediriga a la tabla prestamos
      }
    })
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

  realizarCalculos() {

    this.formulario.get('fecha_inicio_prestamo')?.valueChanges.subscribe(() => {
        this.fechaFinal();
    });

    this.formulario.get('plazo')?.valueChanges.subscribe(() => {
      this.fechaFinal();
      this.abonosDia();
    });

    this.formulario.get('monto_prestado')?.valueChanges.subscribe(() => {
      this.deudaInteres();
    });

    this.formulario.get('intereses')?.valueChanges.subscribe(() => {
      this.deudaInteres();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();

    if (this.id != null) {
      this.clientesGetSubscription.unsubscribe();
      this.promotoresGetSubscription.unsubscribe();
      this.prestamoGetSubscription.unsubscribe();
      this.capitalesGetSubscription.unsubscribe();
    }

    if (this.prestamoPostSubscription != null || this.prestamoPostSubscription != undefined) {
      this.prestamoPostSubscription.unsubscribe();
      //console.log('se elimino el post')
    }

    if (this.prestamoPutSubscription != null || this.prestamoPutSubscription != undefined) {
      this.prestamoPutSubscription.unsubscribe();
      //console.log('se elimino el put')
    }

    if (this.prestamoDeteleSubscription != null || this.prestamoDeteleSubscription != undefined) {
      this.prestamoDeteleSubscription.unsubscribe();
      //console.log('se elimino el delete')
    }

    if (this.festivosGetSubscription) {
      this.festivosGetSubscription.unsubscribe();
    }
  }

  get formularioControl() {//NO borrar
    return this.formulario.controls;
  }

}
