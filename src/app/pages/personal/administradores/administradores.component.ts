import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Administrador } from 'src/app/models/Administrador';
import { AdministradorService } from 'src/app/services/administrador.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administradores',
  templateUrl: './administradores.component.html',
  styleUrls: ['./administradores.component.css']
})
export class AdministradoresComponent implements OnInit, OnDestroy {
  formulario: any;
  dtOptions: DataTables.Settings = {};
  administradores: Administrador[] = [];
  administrador: Administrador[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  estaEnGestion: boolean = false;
  administradoresGetSubscription: Subscription;
  administradorGetSubscription: Subscription;
  administradorPostSubscription: Subscription;
  administradorPutSubscription: Subscription;
  administradorDeteleSubscription: Subscription;
  //Nota importante, mandamos los datos por objeto, mientras la lectura de informacion sera manipulado por arreglos

  constructor(private as: AdministradorService, private router: Router) { }

  ngOnInit(): void {
    this.formularioReactivo();//El formulario quiero a fuerzas que se inicie, debido al formulario establecido en la plantilla,
    //si lo dejo en el else, retorna un error en la consola, porque no se ha iniciado el formulario
    if (this.borroLocalStorage()) {//Si borro el localstorage
      this.router.navigate(['/acceso']);//entonces que redireccione al login
    } else {//si no, entonces se queda en la pagina y
      //que haga lo que tenga que hacer
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 5,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.11.3/i18n/es-mx.json'
        }
      };
      this.obtenerAdministradores();
    }
    //this.redireccionar();
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
      ])
    });
    //console.log(this.formulario);
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

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.administradoresGetSubscription.unsubscribe();
    if (this.administradorGetSubscription != null || this.administradorGetSubscription != undefined) {
      this.administradorGetSubscription.unsubscribe();
      //console.log('se elimino el get edit')
    }

    if (this.administradorPostSubscription != null || this.administradorPostSubscription != undefined) {
      this.administradorPostSubscription.unsubscribe();
      //console.log('se elimino el post')
    }

    if (this.administradorPutSubscription != null || this.administradorPutSubscription != undefined) {
      this.administradorPutSubscription.unsubscribe();
      //console.log('se elimino el put')
    }

    if (this.administradorDeteleSubscription != null || this.administradorDeteleSubscription != undefined) {
      this.administradorDeteleSubscription.unsubscribe();
      //console.log('se elimino el delete')
    }
    //console.log('ngOnDestroy iniciado');
  }

  obtenerAdministradores() {
    this.espere();
    this.administradoresGetSubscription = this.as.getAdministradores().subscribe((res: any) => {
      this.administradores = res;
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

  editarAdmin() {
    this.espere();
    //console.log('con que quieres editar verdad prro!!');
    let administrador = new Administrador();//Creamos una variable local de tipo administrador, no usamos el this.administrador
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
    administrador.nombre = this.formulario.value.nombre;
    administrador.apellidos = this.formulario.value.apellidos;
    if (this.administrador['email'] != this.formulario.value.email) {
      administrador.email = this.formulario.value.email;
    }
    administrador.contraseña = this.formulario.value.password;
    administrador.genero = this.formulario.value.genero;
    administrador.telefono = this.formulario.value.telefono;
    //administrador['id'] = this.administrador['id'];
    //console.log(administrador);
    this.administradorPutSubscription = this.as.putAdministrador(administrador, this.administrador['id']).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se edito el administrador con exito!!';
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
    this.administradorDeteleSubscription = this.as.deleteAdministrador(this.administrador['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se eliminó el administrador con exito!!';
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
    let administrador = new Administrador();
    administrador.nombre = this.formulario.value.nombre;
    administrador.apellidos = this.formulario.value.apellidos;
    administrador.email = this.formulario.value.email;
    administrador.contraseña = this.formulario.value.password;
    administrador.genero = this.formulario.value.genero;
    administrador.telefono = this.formulario.value.telefono;
    administrador.id_rol = 1;
    this.administradorPostSubscription = this.as.postAdministrador(administrador).subscribe((res: any) => {
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

  entroEnGestion(id_administrador: string) {
    this.estaEnGestion = true;
    this.formulario.reset();//vaciamos el formulario
    this.espere();
    this.administradorGetSubscription = this.as.getAdministrador(id_administrador).subscribe((res: any) => {
      //dentro del subscribe estaran los datos consultados de la api, fuera de este no tendras nada
      this.administrador = res;
      //console.log(this.administrador);
      this.presentandoDatos();
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      nombre: this.administrador['nombre'],
      apellidos: this.administrador['apellidos'],
      email: this.administrador['email'],
      genero: this.administrador['genero'],
      telefono: this.administrador['telefono']
    });
    this.cerrarLoading();
  }

  entroEnAgregar() {
    this.estaEnGestion = false;
    this.formulario.reset();//vaciamos el formulario
  }

  get formularioControl() {//NO borrar
    return this.formulario.controls;
  }
}
