import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {url} from './constants';
import { GlobalComponent } from './global-component';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  public  x:any
  ipDtlsReadOut = GlobalComponent.appUrl;
  constructor(public http: HttpClient) { }

  public getBackendData(stname:any, dt:any, fchr:any, isPast:any){
    return this.http.post<any>("http://" +this.ipDtlsReadOut +"inputs",{'stname': stname, 'dt':dt , 'fchour':fchr, 'isPast':isPast})
  }
}
   
