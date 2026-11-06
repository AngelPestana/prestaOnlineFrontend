import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Capital } from '../models/Capital';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapitalService {

  //url: string = 'https://backend-codeigniter.herokuapp.com/public/api/clientes';
    url: string = environment.apiUrl + '/api/capitales';
  
    constructor(private http: HttpClient) { }
  
    getCapitales () {
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          //Siempre especificar el tipo de autorizacion
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      return this.http.get(this.url, httpOptions);
    }
  
    getCapital(id: string) {
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          //Siempre especificar el tipo de autorizacion
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      return this.http.get(this.url + '/edit/' + id, httpOptions);
    }
  
    postCapital(capital: Capital): Observable<Capital> {
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          //Siempre especificar el tipo de autorizacion
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      return this.http.post<Capital>(this.url + '/create', capital, httpOptions);
    }
  
    putCapital(capital: Capital, id: string): Observable<Capital> {
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          //Siempre especificar el tipo de autorizacion
          Authorization: 'Bearer ' + localStorage.getItem('token')
        })
      };
      return this.http.put<Capital>(this.url + '/update/' + id, capital, httpOptions);
    }
  
    deleteCapital(id: string) {
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
