import { APP_BOOTSTRAP_LISTENER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import{FormsModule,ReactiveFormsModule} from '@angular/forms';
import { HistoryComponent } from './history/history.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DatePipe } from '@angular/common';
import { RegisterComponent } from './register/register.component';
import { ManagementComponent } from './management/management.component'
import {MatMenuModule} from '@angular/material/menu';
//import { GoogleMapsModule } from '@angular/google-maps'
import { MatIconModule } from '@angular/material/icon';
import { PastGraphsComponent } from './past-graphs/past-graphs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PastGraphDataComponent } from './past-graph-data/past-graph-data.component';
import { LocationComponent } from './location/location.component'
import { DetailsComponent } from './details/details.component';
import { NgxEchartsModule } from "ngx-echarts";
import { Dashboardv2Component } from './dashboardv2/dashboardv2.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    HistoryComponent,
    SidebarComponent,
    NavbarComponent,
    RegisterComponent,
    ManagementComponent,
    PastGraphsComponent,
    DashboardComponent,
    PastGraphDataComponent,
    LocationComponent,  
    DetailsComponent, Dashboardv2Component  
  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'), 
    }),

    //GoogleMapsModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent] //Main page
})
export class AppModule { }
