import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalComponent } from '../global-component';


@Injectable({
  providedIn: 'root'
})
export class DetailsDataService {
  selectdate(start: any, end: any) {
    throw new Error('Method not implemented.');
  }
  public  x:any
  ipDtlsReadOut = GlobalComponent.appUrl;
  constructor(public http: HttpClient) { 
    
  }

  
}
