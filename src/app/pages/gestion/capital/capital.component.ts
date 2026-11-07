import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Capital } from 'src/app/models/Capital';
import { CapitalService } from 'src/app/services/capital.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-capital',
  templateUrl: './capital.component.html',
  styleUrls: ['./capital.component.css']
})
export class CapitalComponent implements OnInit {

  formulario: any;
    dtOptions: DataTables.Settings = {};
    capitales: Capital[] = [];
    capital: Capital[] = [];
    dtTrigger: Subject<any> = new Subject<any>();
    mensajeEspere: any;
    estaEnGestion: boolean = false;
    capitalesGetSubscription: Subscription;
    capitalGetSubscription: Subscription;
    capitalPostSubscription: Subscription;
    capitalPutSubscription: Subscription;
    capitalDeteleSubscription: Subscription;
    //Nota importante, mandamos los datos por objeto, mientras la lectura de informacion sera manipulado por arreglos
  
    constructor(private cs: CapitalService, private router: Router) { }
  
    ngOnInit(): void {
      this.formularioReactivo();//El formulario quiero a fuerzas que se inicie, debido al formulario establecido en la plantilla,
      //si lo dejo en el else, retorna un error en la consola, porque no se ha iniciado el formulario
      this.iniciarTabla();
    }
  
    iniciarTabla() {
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 5,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
        }
      };
      this.obtenerCapitales();
    }
  
    formularioReactivo(): void {
      this.formulario = new FormGroup({
        nombre: new FormControl('', [
          Validators.required, 
          Validators.minLength(3),
          Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")
        ]),
        descripcion: new FormControl('', [
          Validators.required,
          Validators.minLength(15),
          Validators.pattern("[a-zA-Z ]{15,254}")
        ]),
        montoTotal: new FormControl('', [
          Validators.required
        ]),
        fechaCreacion: new FormControl('', [
          Validators.required
        ])
      });
      //console.log(this.formulario);
    }
  
    ngOnDestroy(): void {
      // Do not forget to unsubscribe the event
      this.dtTrigger.unsubscribe();
      this.capitalesGetSubscription.unsubscribe();
      if (this.capitalGetSubscription != null || this.capitalGetSubscription != undefined) {
        this.capitalGetSubscription.unsubscribe();
        //console.log('se elimino el get edit')
      }
  
      if (this.capitalPostSubscription != null || this.capitalPostSubscription != undefined) {
        this.capitalPostSubscription.unsubscribe();
        //console.log('se elimino el post')
      }
  
      if (this.capitalPutSubscription != null || this.capitalPutSubscription != undefined) {
        this.capitalPutSubscription.unsubscribe();
        //console.log('se elimino el put')
      }
  
      if (this.capitalDeteleSubscription != null || this.capitalDeteleSubscription != undefined) {
        this.capitalDeteleSubscription.unsubscribe();
        //console.log('se elimino el delete')
      }
      //console.log('ngOnDestroy iniciado');
    }
  
    obtenerCapitales() {
      this.espere();
      this.capitalesGetSubscription = this.cs.getCapitales().subscribe((res: any) => {
        this.capitales = res;
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

    formatearFecha2(fechaString: String): Date {
      const fecha = fechaString;

      let fechaConvertida = null;

      if (fecha) {
        const [fechaParte, horaParte] = fecha.split(' ');

        const [anio, mes, dia] = fechaParte.split('-').map(Number);

        const [hora, minutos, segundos] = horaParte.split(':').map(Number);

        fechaConvertida = new Date(
            anio,
            mes - 1,
            dia,
            hora,
            minutos,
            segundos
        );
      }

      return fechaConvertida;
    }

    formatearFecha(date: Date): string {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
  
    editarCapital() {
      this.espere();
      //console.log('con que quieres editar verdad prro!!');
      let capital = new Capital();//Creamos una variable local de tipo administrador, no usamos el this.administrador
      //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
      capital.nombre = this.formulario.value.nombre;
      capital.descripcion = this.formulario.value.descripcion;
      capital.monto_total = this.formulario.value.montoTotal;
      capital.fecha_creacion = this.formatearFecha(this.formulario.value.fechaCreacion);
      console.log(capital);
      this.capitalPutSubscription = this.cs.putCapital(capital, this.capital['id']).subscribe((res: any) => {
        //console.log(res);
        this.cerrarLoading();
        let mensaje = 'Se editó el capital con exito!!';
        this.mensajeExito(mensaje);
      }, (error: any) => {
        this.cerrarLoading();
        //console.log(error);
        let mensajeErrorConEtiquetas = error.error.messages.error;
        let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
        this.mensajeError(mensajeError);
      });
    }
  
    eliminarCapital() {
      this.espere();
      //console.log('con que quieres eliminar verdad prro!!');
      this.capitalDeteleSubscription = this.cs.deleteCapital(this.capital['id']).subscribe((res: any) => {
        this.cerrarLoading();
        let mensaje = 'Se eliminó el capital con exito!!';
        this.mensajeExito(mensaje);
      }, (error: any) => {
        this.cerrarLoading();
        //console.log(error);
        let mensajeError = error.error.messages.error;//no es necesario eliminar etiquetas ya que el metodo delete del api
        //no devuelve mensajes con etiquetas
        this.mensajeError(mensajeError);
      });
    }
  
    agregarCapital() {
      this.espere();
      //console.log('con que quieres agregar verdad prro!!');
      let capital = new Capital();
      capital.nombre = this.formulario.value.nombre;
      capital.descripcion = this.formulario.value.descripcion;
      capital.monto_total = this.formulario.value.montoTotal;
      capital.fecha_creacion = this.formatearFecha(this.formulario.value.fechaCreacion);
      console.log(capital);
      this.capitalPostSubscription = this.cs.postCapital(capital).subscribe((res: any) => {
        //console.log(res);
        this.cerrarLoading();
        let mensaje = 'Se agregó el administrador con exito!!';
        this.mensajeExito(mensaje);
      }, (error: any) => {
        this.cerrarLoading();
        //console.log(error);
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
          window.location.reload();//Para que actualice la tabla
        }
      })
    }
  
    mensajeError(mensajeError: string) {
      Swal.fire({
        icon: 'error',
        title: mensajeError
      })
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
          this.router.navigate(['/home']);//Para que me rediriga a la pagina de inicio
        }
      })
    }
  
    entroEnGestion(id_capital: string) {
      this.estaEnGestion = true;
      this.formulario.reset();//vaciamos el formulario
      this.espere();
      this.capitalGetSubscription = this.cs.getCapital(id_capital).subscribe((res: any) => {
        //dentro del subscribe estaran los datos consultados de la api, fuera de este no tendras nada
        this.capital = res;
        //console.log(this.administrador);
        this.presentandoDatos();
      });
    }
  
    presentandoDatos() {

      /*const fecha = this.capital['fecha_creacion'];

      let fechaConvertida = null;

      if (fecha) {
        const [fechaParte, horaParte] = fecha.split(' ');

        const [anio, mes, dia] = fechaParte.split('-').map(Number);

        const [hora, minutos, segundos] = horaParte.split(':').map(Number);

        fechaConvertida = new Date(
            anio,
            mes - 1,
            dia,
            hora,
            minutos,
            segundos
        );
      }*/

      this.formulario.patchValue({
        nombre: this.capital['nombre'],
        descripcion: this.capital['descripcion'],
        montoTotal: this.capital['monto_total'],
        fechaCreacion: this.formatearFecha2(this.capital['fecha_creacion'])
      });

      //console.log(this.capital['fecha_creacion']);
      this.cerrarLoading();
    }
  
    entroEnAgregar() {
      this.estaEnGestion = false;
      //this.actualizarValidacionPassword();//para que establezca el password obligatorio
      this.formulario.reset();//vaciamos el formulario
    }
  
    /*actualizarValidacionPassword(): void {
      const passwordControl = this.formulario.get('password');
  
      if (!passwordControl) return;
  
      if (this.estaEnGestion) {
        // EDICIÓN → password opcional
        passwordControl.clearValidators();
        passwordControl.setValidators([
          Validators.minLength(4)
        ]);
      } else {
        // CREACIÓN → password obligatorio
        passwordControl.setValidators([
          Validators.required,
          Validators.minLength(4)
        ]);
      }
  
      passwordControl.updateValueAndValidity();
    }*/
  
    get formularioControl() {//NO borrar
      return this.formulario.controls;
    }

}
