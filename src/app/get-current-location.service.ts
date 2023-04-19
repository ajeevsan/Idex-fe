import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GetCurrentLocationService {

  constructor() { }

  public currentStation: string
}
