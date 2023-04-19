import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { url } from './constants';
import { GlobalComponent } from './global-component';


@Injectable({
  providedIn: 'root'
})
export class InitialpredService {
  ipDtlsReadOut = GlobalComponent.appUrl;
  constructor(public http: HttpClient) { }

  public getInitialPredictions(){
    return this.http.get<any>("http://" +this.ipDtlsReadOut +"getInitialPredictions")
  }
}
