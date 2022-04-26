import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Promotor } from '../models/Promotor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromotorService {

  url: string = 'http://localhost:8080/api/promotores';

  constructor(private http: HttpClient) { }

  getPromotores () {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getPromotor(id: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.get(this.url + '/edit/' + id, httpOptions);
  }

  postPromotor(promotor: Promotor): Observable<Promotor> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.post<Promotor>(this.url + '/create', promotor, httpOptions);
  }

  putPromotor(promotor: Promotor, id: string): Observable<Promotor> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    return this.http.put<Promotor>(this.url + '/update/' + id, promotor, httpOptions);
  }

  deletePromotor(id: string) {
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
