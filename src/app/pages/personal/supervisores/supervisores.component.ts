import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Supervisor } from 'src/app/models/Supervisor';
import { SupervisorService } from 'src/app/services/supervisor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-supervisores',
  templateUrl: './supervisores.component.html',
  styleUrls: ['./supervisores.component.css']
})
export class SupervisoresComponent implements OnInit {

  formulario: any;
  dtOptions: DataTables.Settings = {};
  supervisores: Supervisor[] = [];
  supervisor: Supervisor[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  estaEnGestion: boolean = false;
  supervisoresGetSubscription: Subscription;
  supervisorGetSubscription: Subscription;
  supervisorPostSubscription: Subscription;
  supervisorPutSubscription: Subscription;
  supervisorDeteleSubscription: Subscription;
  //Nota importante, mandamos los datos por objeto, mientras la lectura de informacion sera manipulado por arreglos

  constructor(private ss: SupervisorService, private router: Router) { }

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
    this.obtenerSupervisores();
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
    this.supervisoresGetSubscription.unsubscribe();
    if (this.supervisorGetSubscription != null || this.supervisorGetSubscription != undefined) {
      this.supervisorGetSubscription.unsubscribe();
      //console.log('se elimino el get edit')
    }

    if (this.supervisorPostSubscription != null || this.supervisorPostSubscription != undefined) {
      this.supervisorPostSubscription.unsubscribe();
      //console.log('se elimino el post')
    }

    if (this.supervisorPutSubscription != null || this.supervisorPutSubscription != undefined) {
      this.supervisorPutSubscription.unsubscribe();
      //console.log('se elimino el put')
    }

    if (this.supervisorDeteleSubscription != null || this.supervisorDeteleSubscription != undefined) {
      this.supervisorDeteleSubscription.unsubscribe();
      //console.log('se elimino el delete')
    }
    //console.log('ngOnDestroy iniciado');
  }

  obtenerSupervisores() {
    this.espere();
    this.supervisoresGetSubscription = this.ss.getSupervisores().subscribe((res: any) => {
      this.supervisores = res;
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
    let supervisor = new Supervisor();//Creamos una variable local de tipo supervisor, no usamos el this.supervisor
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.supervisor, es la que se mostro antes de modificar
    supervisor.nombre = this.formulario.value.nombre;
    supervisor.apellidos = this.formulario.value.apellidos;
    if (this.supervisor['email'] != this.formulario.value.email) {
      supervisor.email = this.formulario.value.email;
    }
    supervisor.contraseña = this.formulario.value.password;
    supervisor.genero = this.formulario.value.genero;
    supervisor.telefono = this.formulario.value.telefono;
    supervisor.direccion = this.formulario.value.direccion;
    //supervisor['id'] = this.supervisor['id'];
    //console.log(supervisor);
    this.supervisorPutSubscription = this.ss.putSupervisor(supervisor, this.supervisor['id']).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se edito el supervisor con exito!!';
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
    this.supervisorDeteleSubscription = this.ss.deleteSupervisor(this.supervisor['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se eliminó el supervisor con exito!!';
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
    let supervisor = new Supervisor();
    supervisor.nombre = this.formulario.value.nombre;
    supervisor.apellidos = this.formulario.value.apellidos;
    supervisor.email = this.formulario.value.email;
    supervisor.contraseña = this.formulario.value.password;
    supervisor.genero = this.formulario.value.genero;
    supervisor.telefono = this.formulario.value.telefono;
    supervisor.direccion = this.formulario.value.direccion;
    supervisor.id_rol = 1;
    this.supervisorPostSubscription = this.ss.postSupervisor(supervisor).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se agregó el supervisor con exito!!';
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

  entroEnGestion(id_supervisor: string) {
    this.estaEnGestion = true;
    this.formulario.reset();//vaciamos el formulario
    this.espere();
    this.supervisorGetSubscription = this.ss.getSupervisor(id_supervisor).subscribe((res: any) => {
      //dentro del subscribe estaran los datos consultados de la api, fuera de este no tendras nada
      this.supervisor = res;
      //console.log(this.supervisor);
      this.presentandoDatos();
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      nombre: this.supervisor['nombre'],
      apellidos: this.supervisor['apellidos'],
      email: this.supervisor['email'],
      genero: this.supervisor['genero'],
      telefono: this.supervisor['telefono'],
      direccion: this.supervisor['direccion']
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
