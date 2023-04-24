import { Component, OnInit, Input } from '@angular/core';
// import { GetCurrentLocationService } from '../get-current-location.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SharedDataService } from '../shared-data.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css'],
})
export class LocationComponent implements OnInit {
  selectCity: any;

  constructor(private router: Router, public shareData : SharedDataService) {}

  onlyOnceLocation(event: any) {
    console.log('We are inside the Select Location Function');
    this.selectCity = event.target.parentElement.innerText;
    console.log(this.selectCity);
    this.shareData.updateSelectedData(this.selectCity)
    this.router.navigate(['/dashboard']);
  }

  get selectedCity(){
    return this.shareData.selectedCity;
  }
  
  ngOnInit(): void {
  }
}
