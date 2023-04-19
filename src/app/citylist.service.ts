import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalComponent } from './global-component';

@Injectable({
  providedIn: 'root'
})
export class CitylistService {

  ipDtlsReadOut = GlobalComponent.appUrl;
  constructor(public http: HttpClient) { }

  public getCityList(){
    return this.http.get<any>("http://" +this.ipDtlsReadOut +"selectCity")
  }
}
