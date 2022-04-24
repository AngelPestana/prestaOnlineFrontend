import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Administrador } from '../models/Administrador';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {

  url: string = 'http://localhost:8080/api/administradores';

  constructor(private http: HttpClient) { }

  getAdministradores () {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getAdministrador(id: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url + '/edit/' + id, httpOptions);
  }

  postAdministrador(administrador: Administrador): Observable<Administrador> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.post<Administrador>(this.url + '/create', administrador, httpOptions);
  }

  putAdministrador(administrador: Administrador, id: string): Observable<Administrador> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.put<Administrador>(this.url + '/update/' + id, administrador, httpOptions);
  }

  deleteAdministrador(id: string) {
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
