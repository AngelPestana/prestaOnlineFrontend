import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from 'src/app/models/Login';
import { AccesoService } from 'src/app/services/acceso.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-acceso',
  templateUrl: './acceso.component.html',
  styleUrls: ['./acceso.component.css']
})
export class AccesoComponent implements OnInit {
  formulario: any;
  mensajeEspere: any;

  constructor(private router: Router, private as: AccesoService) { }

  ngOnInit(): void {
    this.redireccionar();
    this.formularioReactivo();
  }

  redireccionar(): void {
    //console.log(localStorage.getItem('accedio'));
    if (localStorage.getItem('token')) {
      this.router.navigate(['/home']);
    }
  }

  formularioReactivo(): void {
    this.formulario = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(11),
        Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$')
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ])
    });
    //console.log(this.formulario);
  }

  espere () {
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

  entrar(): void {
    //console.log('entrar');
    this.espere();
    let email = this.formulario.value.email;
    let password = this.formulario.value.password;
    let login = new Login();
    login.email = email;
    login.contraseña = password;
    this.as.postLogin(login).subscribe((res: any) => {
      //console.log(res);
      localStorage.setItem('token', res.Token);
      localStorage.setItem('nombre', res.user.nombre);
      localStorage.setItem('id_rol', res.user.id_rol);
      let date = new Date();
      let time = date.getTime();
      let time2 = time + (((12 * 60 * 60)*1000) - 10000);
      localStorage.setItem('tiempoExpirado', time2.toString());
      //console.log(time2);
      this.cerrarLoading();
      this.mensajeInicioSesion();
      this.router.navigate(['/home']);
    }, (error: any) => {
      //console.log(error.error.messages.error);
      this.cerrarLoading();
      this.mensajeErrorIniciarSesion(error.error.messages.error);
    });
  }

  mensajeInicioSesion() {
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenid@ ' + localStorage.getItem('nombre') + ' a PrestaOnline!',
    })
  }

  mensajeErrorIniciarSesion(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: mensaje
    })
  }

  cerrarLoading() {
    setTimeout(() => {//para detener el loading
      //console.log(this.loading);
      this.mensajeEspere.close();
    }, 500);
  }

  get formularioControl() {//NO borrar
    return this.formulario.controls;
  }

}
