import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Login } from '../models/Login';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccesoService {

  //url: string = 'https://backend-codeigniter.herokuapp.com/public/auth/';
  url: string = environment.apiUrl + '/auth/';

  constructor(private http: HttpClient) { }

  postLogin(login: Login): Observable<Login> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Login>(this.url + 'login', login, httpOptions);
  }

  postLogout() {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        //Siempre especificar el tipo de autorizacion
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };
    //segundo parametro corresponde al data que enviamos, en este caso es de cerrar sesion por lo mismo no mandamos nada y en el tercer 
    //parametro mandamos el httpOptions que es el header que se usa para enviar el token
    return this.http.post(this.url + 'logout', '', httpOptions);
  }
}
