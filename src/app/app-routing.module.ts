import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PastGraphsComponent } from './past-graphs/past-graphs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LocationComponent } from "./location/location.component";
import { DetailsComponent } from "./details/details.component"
import { HomeComponent } from './home/home.component';
import { NewDashboardComponent } from './new-dashboard/new-dashboard.component';
import { Dashboardv2Component } from './dashboardv2/dashboardv2.component';

const routes: Routes = [
  {
    path: "dashboard",  component : DashboardComponent
  },
  {
    path: "",  component : LocationComponent
  },
  // {
  //   path: "pastGraphs",  component : PastGraphsComponent
  // },
  {
    path: "details" , component : DetailsComponent
  },
  // {
  //   path:"home", component: HomeComponent
  // },
  // {
  //   path:"dashboard", component: Dashboardv2Component
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
