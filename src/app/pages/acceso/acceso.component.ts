import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccesoService } from 'src/app/services/acceso.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-acceso',
  templateUrl: './acceso.component.html',
  styleUrls: ['./acceso.component.css']
})
export class AccesoComponent implements OnInit {
  formulario: any;

  constructor(private router: Router, private as: AccesoService) { }

  ngOnInit(): void {
    this.redireccionar();
    this.formularioReactivo();
  }

  redireccionar(): void {
    //console.log(localStorage.getItem('accedio'));
    if (localStorage.getItem('accedio')) {
      this.router.navigate(['/inicio']);
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

  entrar(): void {
    console.log('entrar');
    let email = this.formulario.value.email;
    let password = this.formulario.value.password;
    let formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    this.as.postLogin(formData).subscribe((res: any) => {
      console.log(res);
    });
    //console.log(email+' '+password);
    /*
    if (email === this.email1 && password === this.contraseña1) {
      this.router.navigate(['/']);
      this.acceder();
      localStorage.setItem('accedio', 'true');
    } else if (email === this.email2 && password === this.contraseña2) {
      this.router.navigate(['/']);
      this.acceder();
      localStorage.setItem('accedio', 'true');
    } else {
      this.formulario.reset();
      this.mensajeError = "Usuario o contraseña incorrectos";
      //alert(this.mensajeError);
      this.mensajePersonalizado();
    }
    //console.log(email);
    //localStorage.setItem('accedio', 'true');
    */
  }

  acceder(): void {
    Swal.fire({
      title: '<strong>¡Bienvenid@!</strong>',
      icon: 'success',
      imageUrl: '../../../assets/img/polar/img4.gif',
      imageWidth: 200,
      imageHeight: 200,
      imageAlt: 'Custom image'
    })
  }

  mensajePersonalizado() {
    Swal.fire({
      title: '<strong>Datos incorrectos!!</strong>',
      icon: 'error',
      text: 'Verifique sus datos!!',
      imageUrl: '../../../assets/img/polar/img3.gif',
      imageWidth: 200,
      imageHeight: 200,
      imageAlt: 'Custom image'
    })
  }

  get formularioControl() {//NO borrar
    return this.formulario.controls;
  }

}
