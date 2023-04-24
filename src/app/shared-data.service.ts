import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }

  selectedCity: any;

  updateSelectedData(data: any) {    
    this.selectedCity = data;
  }
}
