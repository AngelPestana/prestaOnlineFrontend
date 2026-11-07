import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Festivo } from '../models/Festivo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiaFestivoService {

  //url: string = 'https://backend-codeigniter.herokuapp.com/public/api/clientes';
      url: string = environment.apiUrl + '/api/festivos';
    
      constructor(private http: HttpClient) { }
    
      getDiasFestivos () {
        let httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            //Siempre especificar el tipo de autorizacion
            Authorization: 'Bearer ' + localStorage.getItem('token')
          })
        };
        return this.http.get(this.url, httpOptions);
      }
    
      getDiaFestivo(id: string) {
        let httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            //Siempre especificar el tipo de autorizacion
            Authorization: 'Bearer ' + localStorage.getItem('token')
          })
        };
        return this.http.get(this.url + '/edit/' + id, httpOptions);
      }
    
      postDiaFestivo(festivo: Festivo): Observable<Festivo> {
        let httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            //Siempre especificar el tipo de autorizacion
            Authorization: 'Bearer ' + localStorage.getItem('token')
          })
        };
        return this.http.post<Festivo>(this.url + '/create', festivo, httpOptions);
      }
    
      putDiaFestivo(festivo: Festivo, id: string): Observable<Festivo> {
        let httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            //Siempre especificar el tipo de autorizacion
            Authorization: 'Bearer ' + localStorage.getItem('token')
          })
        };
        return this.http.put<Festivo>(this.url + '/update/' + id, festivo, httpOptions);
      }
    
      deleteDiaFestivo(id: string) {
        let httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            //Siempre especificar el tipo de autorizacion
            Authorization: 'Bearer ' + localStorage.getItem('token')
          })
        };
        return this.http.delete(this.url + '/delete/' + id, httpOptions);
      }

      
}
