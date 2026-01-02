import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Abono } from 'src/app/models/Abono';
import { AbonoService } from 'src/app/services/abono.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-abonos',
  templateUrl: './abonos.component.html',
  styleUrls: ['./abonos.component.css']
})
export class AbonosComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  abonos: Abono[] = [];
  abono: Abono[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  mensajeEspere: any;
  abonosGetSubscription: Subscription;
  abonoGetSubscription: Subscription;
  id_rol = '';
  formulario: any;

  constructor(private as: AbonoService, private router: Router) { }

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
      fecha_abono: new FormControl(),
      cantidad_abonar: new FormControl(),
      total_pagado: new FormControl(),
      cambio: new FormControl(),
      debia: new FormControl(),
      ahora_debe: new FormControl(),
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
    this.obtenerAbonos();
  }

  obtenerAbonos() {
    this.espere();
    this.abonosGetSubscription = this.as.getAbonos().subscribe((res: any) => {
      this.abonos = res;
      //console.log(this.abonos);
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

  verAbono(id_abono : string) {
    this.formulario.reset();//vaciamos el formulario
    this.espere();
    this.abonoGetSubscription = this.as.getAbono(id_abono).subscribe((res: any) => {
      //console.log(res);
      this.abono = res;
      this.presentandoDatos();
      //this.formulario.setValue(res);
      //this.cerrarLoading();
    });
  }

  presentandoDatos() {
    this.formulario.patchValue({
      Supervisor: this.abono['Supervisor'],
      Promotor: this.abono['Promotor'],
      Cliente: this.abono['Cliente'],
      fecha_abono: this.abono['fecha_abono'],
      cantidad_abonar: this.abono['cantidad_abonar'],
      total_pagado: this.abono['total_pagado'],
      cambio: this.abono['cambio'],
      debia: this.abono['debia'],
      ahora_debe: this.abono['ahora_debe'],
      created_at: this.abono['created_at']
    });
    this.cerrarLoading();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.abonosGetSubscription.unsubscribe();

    if (this.abonoGetSubscription != null || this.abonoGetSubscription != undefined) {
      this.abonoGetSubscription.unsubscribe();
      //console.log('se elimino el get edit')
    }
  }


}
