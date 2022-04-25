import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Supervisor } from '../models/Supervisor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {

  url: string = 'http://localhost:8080/api/supervisores';

  constructor(private http: HttpClient) { }

  getSupervisores () {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getSupervisor(id: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url + '/edit/' + id, httpOptions);
  }

  postSupervisor(supervisor: Supervisor): Observable<Supervisor> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.post<Supervisor>(this.url + '/create', supervisor, httpOptions);
  }

  putSupervisor(supervisor: Supervisor, id: string): Observable<Supervisor> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.put<Supervisor>(this.url + '/update/' + id, supervisor, httpOptions);
  }

  deleteSupervisor(id: string) {
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

