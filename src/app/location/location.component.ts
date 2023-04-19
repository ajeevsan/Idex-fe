import { Component, OnInit, Input } from '@angular/core';
// import { GetCurrentLocationService } from '../get-current-location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css'],
})
export class LocationComponent implements OnInit {
  selectedCity: any;

  constructor(private router: Router) {}

  onlyOnceLocation(event: any) {
    console.log('We are inside the Select Location Function');
    let data = event.target.parentElement.innerText;
    this.router.navigate(['/dashboard', data]);
  }



  ngOnInit(): void {
  }
}
