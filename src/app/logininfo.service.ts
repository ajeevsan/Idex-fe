import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GlobalComponent } from './global-component';

@Injectable({
  providedIn: 'root'
})
export class LogininfoService {

  ipDtlsReadOut = GlobalComponent.appUrl;

  constructor(public http: HttpClient) { }
  // super-admin management
  public getUserRequests() {
    return this.http.get<any>("http://"+this.ipDtlsReadOut +"getUserRequests")
  }
  public getUserActive(){
    return this.http.get<any>("http://" +this.ipDtlsReadOut + "getUserActive")
  }
  public getUserInactive(){
    return this.http.get<any>("http://" +this.ipDtlsReadOut + "getUserInactive")
  }
  public updateUser(condition_column:any, condition_value:any, updating_column:any, updating_value:any){
    return this.http.post<any>("http://" +this.ipDtlsReadOut +"updateUser",{"condition_column": condition_column, "condition_value": condition_value, "updating_column": updating_column, "updating_value": updating_value})
  }
  public deleteUser(condition_column:any, condition_value:any){
    return this.http.post<any>("http://" +this.ipDtlsReadOut + "deleteUser",{"condition_column": condition_column, "condition_value": condition_value})
  }

  // Register page 
  public registerUser(insertToDatabase:any){
    return this.http.post<any>("http://" +this.ipDtlsReadOut + "registerUser",{"registerUserInfo": insertToDatabase})
  }

}

