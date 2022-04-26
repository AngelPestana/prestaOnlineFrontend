import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/Cliente';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  url: string = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) { }

  getClientes () {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getCliente(id: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url + '/edit/' + id, httpOptions);
  }

  postCliente(cliente: Cliente): Observable<Cliente> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.post<Cliente>(this.url + '/create', cliente, httpOptions);
  }

  putCliente(cliente: Cliente, id: string): Observable<Cliente> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.put<Cliente>(this.url + '/update/' + id, cliente, httpOptions);
  }

  deleteCliente(id: string) {
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
