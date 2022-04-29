import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Cliente } from 'src/app/models/Cliente';
import { ClienteService } from 'src/app/services/cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  formulario: any;
  dtOptions: DataTables.Settings = {};
  clientes: Cliente[] = [];
  cliente: Cliente[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  estaEnGestion: boolean = false;
  clientesGetSubscription: Subscription;
  clienteGetSubscription: Subscription;
  clientePostSubscription: Subscription;
  clientePutSubscription: Subscription;
  clienteDeteleSubscription: Subscription;
  //Nota importante, mandamos los datos por objeto, mientras la lectura de informacion sera manipulado por arreglos

  constructor(private cs: ClienteService, private router: Router) { }

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
    this.obtenerClientes();
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
      ]),
      ocupacion: new FormControl('', [
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
    this.clientesGetSubscription.unsubscribe();
    if (this.clienteGetSubscription != null || this.clienteGetSubscription != undefined) {
      this.clienteGetSubscription.unsubscribe();
      //console.log('se elimino el get edit')
    }

    if (this.clientePostSubscription != null || this.clientePostSubscription != undefined) {
      this.clientePostSubscription.unsubscribe();
      //console.log('se elimino el post')
    }

    if (this.clientePutSubscription != null || this.clientePutSubscription != undefined) {
      this.clientePutSubscription.unsubscribe();
      //console.log('se elimino el put')
    }

    if (this.clienteDeteleSubscription != null || this.clienteDeteleSubscription != undefined) {
      this.clienteDeteleSubscription.unsubscribe();
      //console.log('se elimino el delete')
    }
    //console.log('ngOnDestroy iniciado');
  }

  obtenerClientes() {
    this.espere();
    this.clientesGetSubscription = this.cs.getClientes().subscribe((res: any) => {
      this.clientes = res;
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
    let cliente = new Cliente();//Creamos una variable local de tipo cliente, no usamos el this.cliente
    //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.cliente, es la que se mostro antes de modificar
    cliente.nombre = this.formulario.value.nombre;
    cliente.apellidos = this.formulario.value.apellidos;
    if (this.cliente['email'] != this.formulario.value.email) {
      cliente.email = this.formulario.value.email;
    }
    cliente.contraseña = this.formulario.value.password;
    cliente.genero = this.formulario.value.genero;
    cliente.telefono = this.formulario.value.telefono;
    cliente.direccion = this.formulario.value.direccion;
    cliente.ocupacion = this.formulario.value.ocupacion;
    //cliente['id'] = this.cliente['id'];
    //console.log(cliente);
    this.clientePutSubscription = this.cs.putCliente(cliente, this.cliente['id']).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se edito el cliente con exito!!';
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
    this.clienteDeteleSubscription = this.cs.deleteCliente(this.cliente['id']).subscribe((res: any) => {
      this.cerrarLoading();
      let mensaje = 'Se eliminó el cliente con exito!!';
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
    let cliente = new Cliente();
    cliente.nombre = this.formulario.value.nombre;
    cliente.apellidos = this.formulario.value.apellidos;
    cliente.email = this.formulario.value.email;
    cliente.contraseña = this.formulario.value.password;
    cliente.genero = this.formulario.value.genero;
    cliente.telefono = this.formulario.value.telefono;
    cliente.direccion = this.formulario.value.direccion;
    cliente.ocupacion = this.formulario.value.ocupacion;
    cliente.id_rol = 1;
    this.clientePostSubscription = this.cs.postCliente(cliente).subscribe((res: any) => {
      //console.log(res);
      this.cerrarLoading();
      let mensaje = 'Se agregó el cliente con exito!!';
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

  entroEnGestion(id_cliente: string) {
    this.estaEnGestion = true;
    this.formulario.reset();//vaciamos el formulario
    this.espere();
    this.clienteGetSubscription = this.cs.getCliente(id_cliente).subscribe((res: any) => {
      //dentro del subscribe estaran los datos consultados de la api, fuera de este no tendras nada
      this.cliente = res;
      //console.log(this.cliente);
      this.presentandoDatos();
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      nombre: this.cliente['nombre'],
      apellidos: this.cliente['apellidos'],
      email: this.cliente['email'],
      genero: this.cliente['genero'],
      telefono: this.cliente['telefono'],
      direccion: this.cliente['direccion'],
      ocupacion: this.cliente['ocupacion']
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
