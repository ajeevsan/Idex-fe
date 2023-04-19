import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { HomeService } from '../home.service';
import { HttpClient } from '@angular/common/http';
import { CitylistService } from '../citylist.service';
import { ForecasthoursService } from '../forecasthours.service';
import { InitialpredService } from '../initialpred.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router:Router, private activatedRoute:ActivatedRoute, public service: HomeService,  public service2: CitylistService,public service3: InitialpredService, public http: HttpClient) { }
  
  ngOnInit() {
  }
    logout()
    {
      console.log("Inside logout $$$$$$$$$$$$$$$")
      this.router.navigateByUrl('/');
    }
  

}