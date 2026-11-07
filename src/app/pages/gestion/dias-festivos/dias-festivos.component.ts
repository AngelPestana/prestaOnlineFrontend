import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Festivo } from 'src/app/models/Festivo';
import { DiaFestivoService } from 'src/app/services/dia-festivo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dias-festivos',
  templateUrl: './dias-festivos.component.html',
  styleUrls: ['./dias-festivos.component.css']
})
export class DiasFestivosComponent implements OnInit {

  formulario: any;
      dtOptions: DataTables.Settings = {};
      festivos: Festivo[] = [];
      festivo: Festivo[] = [];
      dtTrigger: Subject<any> = new Subject<any>();
      mensajeEspere: any;
      estaEnGestion: boolean = false;
      festivosGetSubscription: Subscription;
      festivoGetSubscription: Subscription;
      festivoPostSubscription: Subscription;
      festivoPutSubscription: Subscription;
      festivoDeteleSubscription: Subscription;
      //Nota importante, mandamos los datos por objeto, mientras la lectura de informacion sera manipulado por arreglos
    
      constructor(private dfs: DiaFestivoService, private router: Router) { }
    
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
        this.obtenerFestivos();
      }
    
      formularioReactivo(): void {
        this.formulario = new FormGroup({
          fecha: new FormControl('', [
            Validators.required
          ]),
          descripcion: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern("[a-zA-Z ]{3,254}")
          ]),
          anio: new FormControl('', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(4),
            Validators.pattern("[0-9]{4}")
          ])
        });
        //console.log(this.formulario);
      }
    
      ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
        this.festivosGetSubscription.unsubscribe();
        if (this.festivoGetSubscription != null || this.festivoGetSubscription != undefined) {
          this.festivoGetSubscription.unsubscribe();
          //console.log('se elimino el get edit')
        }
    
        if (this.festivoPostSubscription != null || this.festivoPostSubscription != undefined) {
          this.festivoPostSubscription.unsubscribe();
          //console.log('se elimino el post')
        }
    
        if (this.festivoPutSubscription != null || this.festivoPutSubscription != undefined) {
          this.festivoPutSubscription.unsubscribe();
          //console.log('se elimino el put')
        }
    
        if (this.festivoDeteleSubscription != null || this.festivoDeteleSubscription != undefined) {
          this.festivoDeteleSubscription.unsubscribe();
          //console.log('se elimino el delete')
        }
        //console.log('ngOnDestroy iniciado');
      }
    
      obtenerFestivos() {
        this.espere();
        this.festivosGetSubscription = this.dfs.getDiasFestivos().subscribe((res: any) => {
          this.festivos = res;
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
        if (!fechaString) {
          return null;
        }

        const [anio, mes, dia] = fechaString.split('-').map(Number);

        return new Date(anio, mes - 1, dia);
      }
  
      formatearFecha(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
      }
    
      editarFestivo() {
        this.espere();
        //console.log('con que quieres editar verdad prro!!');
        let festivo = new Festivo();//Creamos una variable local de tipo administrador, no usamos el this.administrador
        //porque queremos mandar nuevos valores para editar, la informacion que tiene el this.administrador, es la que se mostro antes de modificar
        festivo.fecha = this.formatearFecha(this.formulario.value.fecha);
        festivo.descripcion = this.formulario.value.descripcion;
        festivo.anio = this.formulario.value.anio;
        //capital.fecha_creacion = this.formatearFecha(this.formulario.value.fechaCreacion);
        console.log(festivo);
        this.festivoPutSubscription = this.dfs.putDiaFestivo(festivo, this.festivo['id']).subscribe((res: any) => {
          //console.log(res);
          this.cerrarLoading();
          let mensaje = 'Se editó el dia festivo con exito!!';
          this.mensajeExito(mensaje);
        }, (error: any) => {
          this.cerrarLoading();
          //console.log(error);
          let mensajeErrorConEtiquetas = error.error.messages.error;
          let mensajeError = mensajeErrorConEtiquetas.replace(/<[^>]*>?/g, '');
          this.mensajeError(mensajeError);
        });
      }
    
      eliminarFestivo() {
        this.espere();
        //console.log('con que quieres eliminar verdad prro!!');
        this.festivoDeteleSubscription = this.dfs.deleteDiaFestivo(this.festivo['id']).subscribe((res: any) => {
          this.cerrarLoading();
          let mensaje = 'Se eliminó el dia festivo con exito!!';
          this.mensajeExito(mensaje);
        }, (error: any) => {
          this.cerrarLoading();
          //console.log(error);
          let mensajeError = error.error.messages.error;//no es necesario eliminar etiquetas ya que el metodo delete del api
          //no devuelve mensajes con etiquetas
          this.mensajeError(mensajeError);
        });
      }
    
      agregarFestivo() {
        this.espere();
        //console.log('con que quieres agregar verdad prro!!');
        let festivo = new Festivo();
        festivo.fecha = this.formatearFecha(this.formulario.value.fecha);
        festivo.descripcion = this.formulario.value.descripcion;
        festivo.anio = this.formulario.value.anio;
        //capital.fecha_creacion = this.formatearFecha(this.formulario.value.fechaCreacion);
        console.log(festivo);
        this.festivoPostSubscription = this.dfs.postDiaFestivo(festivo).subscribe((res: any) => {
          //console.log(res);
          this.cerrarLoading();
          let mensaje = 'Se agregó el dia festivo con exito!!';
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
    
      entroEnGestion(id_festivo: string) {
        this.estaEnGestion = true;
        this.formulario.reset();//vaciamos el formulario
        this.espere();
        this.festivoGetSubscription = this.dfs.getDiaFestivo(id_festivo).subscribe((res: any) => {
          //dentro del subscribe estaran los datos consultados de la api, fuera de este no tendras nada
          this.festivo = res;
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

        console.log(this.festivo['fecha']);
  
        this.formulario.patchValue({
          fecha: this.formatearFecha2(this.festivo['fecha']),
          descripcion: this.festivo['descripcion'],
          anio: this.festivo['anio'],
          //fechaCreacion: this.formatearFecha2(this.capital['fecha_creacion'])
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
