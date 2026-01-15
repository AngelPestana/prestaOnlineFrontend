import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Promotor } from 'src/app/models/Promotor';
import { PromotorService } from 'src/app/services/promotor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-promotores',
  templateUrl: './promotores.component.html',
  styleUrls: ['./promotores.component.css']
})
export class PromotoresComponent implements OnInit {

  formulario: any;
  dtOptions: DataTables.Settings = {};
  promotores: Promotor[] = [];
  promotor: Promotor[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  estaEnGestion: boolean = false;
  promotoresGetSubscription: Subscription;
  promotorGetSubscription: Subscription;
  promotorPostSubscription: Subscription;
  promotorPutSubscription: Subscription;
  promotorDeteleSubscription: Subscription;
  //Nota importante, mandamos los datos por objeto, mientras la lectura de informacion sera manipulado por arreglos

  constructor(private ps: PromotorService, private router: Router) { }

  ngOnInit(): void {
    this.formularioReactivo();//El formulario quiero a fuerzas que se inicie, debido al formulario establecido en la plantilla,
    //si lo dejo en el else, retorna un error en la consola, porque no se ha iniciado el formulario
    this.iniciarTabla();
    //this.redireccionar();
  }

  iniciarTabla() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
      }
    };
    this.obtenerPromotores();
  }

  formularioReactivo(): void {
    this.formulario = new FormGroup({
      nombre: new FormControl('', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")
      ]),
      apellidos: new FormControl('', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,64}")
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(11),
        Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$')
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ]),
      genero: new FormControl('', [
        Validators.required
      ]),
      telefono: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern("[0-9]{3}[0-9]{3}[0-9]{2}[0-9]{2}")
      ]),
      direccion: new FormControl('', [
        Validators.required,
        Validators.minLength(15),
        Validators.pattern("[a-zA-Z ]{15,254}")
      ])
    });
    //console.log(this.formulario);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.promotoresGetSubscription.unsubscribe();
    if (this.promotorGetSubscription != null || this.promotorGetSubscription != undefined) {
      this.promotorGetSubscription.unsubscribe();
      //console.log('se elimino el get edit')
    }

    if (this.promotorPostSubscription != null || this.promotorPostSubscription != undefined) {
      this.promotorPostSubscription.unsubscribe();
      //console.log('se elimino el post')
    }

    if (this.promotorPutSubscription != null || this.promotorPutSubscription != undefined) {
      this.promotorPutSubscription.unsubscribe();
      //console.log('se elimino el put')
    }

    if (this.promotorDeteleSubscription != null || this.promotorDeteleSubscription != undefined) {
      this.promotorDeteleSubscription.unsubscribe();
      //console.log('se elimino el delete')
    }
    //console.log('ngOnDestroy iniciado');
  }

  obtenerPromotores() {
    this.espere();
    this.promotoresGetSubscription = this.ps.getPromotores().subscribe((res: any) => {
      this.promotores = res;
      //console.log(res);
      this.dtTrigger.next(0);
      this.cerrarLoading();
    }, (error => {
      //console.log(error);
      this.cerrarLoading();
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

  editarAdmin() {
    this.espere();
    //console.log('con que quieres editar verdad prro!!');
    let promotor = new Promotor();//Creamos una variable local de tipo promotor, no usamos el this.promotor
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.promotor, es la que se mostro antes de modificar
    promotor.nombre = this.formulario.value.nombre;
    promotor.apellidos = this.formulario.value.apellidos;
    if (this.promotor['email'] != this.formulario.value.email) {
      promotor.email = this.formulario.value.email;
    }
    promotor.contraseña = this.formulario.value.password;
    promotor.genero = this.formulario.value.genero;
    promotor.telefono = this.formulario.value.telefono;
    promotor.direccion = this.formulario.value.direccion;
    //promotor['id'] = this.promotor['id'];
    //console.log(promotor);
    this.promotorPutSubscription = this.ps.putPromotor(promotor, this.promotor['id']).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se edito el promotor con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      //console.log(error);
      let mensajeErrorConEtiquetas = error.error.messages.error;
      let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
      this.mensajeError(mensajeError);
    });
  }

  eliminarAdmin() {
    this.espere();
    //console.log('con que quieres eliminar verdad prro!!');
    this.promotorDeteleSubscription = this.ps.deletePromotor(this.promotor['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se eliminó el promotor con exito!!';
      this.mensajeExito(mensaje);
    }, (error: any) => {
      this.cerrarLoading();
      //console.log(error);
      let mensajeError = error.error.messages.error;//no es necesario eliminar etiquetas ya que el metodo delete del api
      //no devuelve mensajes con etiquetas
      this.mensajeError(mensajeError);
    });
  }

  agregarAdmin() {
    this.espere();
    //console.log('con que quieres agregar verdad prro!!');
    let promotor = new Promotor();
    promotor.nombre = this.formulario.value.nombre;
    promotor.apellidos = this.formulario.value.apellidos;
    promotor.email = this.formulario.value.email;
    promotor.contraseña = this.formulario.value.password;
    promotor.genero = this.formulario.value.genero;
    promotor.telefono = this.formulario.value.telefono;
    promotor.direccion = this.formulario.value.direccion;
    promotor.id_rol = 1;
    this.promotorPostSubscription = this.ps.postPromotor(promotor).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se agregó el promotor con exito!!';
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

  entroEnGestion(id_promotor: string) {
    this.estaEnGestion = true;
    this.actualizarValidacionPassword();//para que establezca el password opcional
    this.formulario.reset();//vaciamos el formulario
    this.espere();
    this.promotorGetSubscription = this.ps.getPromotor(id_promotor).subscribe((res: any) => {
      //dentro del subscribe estaran los datos consultados de la api, fuera de este no tendras nada
      this.promotor = res;
      //console.log(this.promotor);
      this.presentandoDatos();
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      nombre: this.promotor['nombre'],
      apellidos: this.promotor['apellidos'],
      email: this.promotor['email'],
      genero: this.promotor['genero'],
      telefono: this.promotor['telefono'],
      direccion: this.promotor['direccion']
    });
    this.cerrarLoading();
  }

  entroEnAgregar() {
    this.estaEnGestion = false;
    this.actualizarValidacionPassword();//para que establezca el password obligatorio
    this.formulario.reset();//vaciamos el formulario
  }

  actualizarValidacionPassword(): void {
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
  }

  get formularioControl() {//NO borrar
    return this.formulario.controls;
  }

}
