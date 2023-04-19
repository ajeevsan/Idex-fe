import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {url} from './constants';
import { GlobalComponent } from './global-component';

@Injectable({
  providedIn: 'root'
})
export class ForecasthoursService {

  public  x:any
  ipDtlsReadOut = GlobalComponent.appUrl;
  constructor(public http: HttpClient) { }

  public getForecastHour(fchr:any){
    return this.http.post<any>("http://" +this.ipDtlsReadOut +"fchour",{'fchour': fchr})
  }
}
