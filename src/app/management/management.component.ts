import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { LogininfoService } from '../logininfo.service';



@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})

export class ManagementComponent implements OnInit {
  public displayUsers:any[]=[];
  public requestingUserInfo:any[]=[];
  public activeUserInfo:any[]=[];
  public inactiveUserInfo:any[]=[];
  public display_name:any;
  public requestFlag=false;
  public activeFlag=false;
  public inactiveFlag=false;

  constructor(private router: Router,public service: LogininfoService) {
    this.requestsPage()
  }

  ngOnInit(): void {
  }

  onDashboard(){
    this.router.navigateByUrl('/home') ; 
  }
  logout()
  {
    console.log("Inside logout $$$$$$$$$$$$$$$")
    this.router.navigateByUrl('/');
  }

  requestsPage(){
    this.service.getUserRequests().subscribe(requestUsers => 
      {
          this.requestingUserInfo = requestUsers['request_userlist']
          console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhh",this.requestingUserInfo);
      })
      this.displayUsers = this.requestingUserInfo
      this.requestFlag=true;
      this.activeFlag=false;
      this.inactiveFlag=false;
      this.display_name = "User Requests"
  }
  activePage(){
    this.service.getUserActive().subscribe(activeUsers => 
      {
          this.activeUserInfo = activeUsers['active_userlist']
          console.log(this.activeUserInfo);
      })
      this.displayUsers = this.activeUserInfo
      this.requestFlag=false;
      this.activeFlag=true;
      this.inactiveFlag=false;
      this.display_name = "Active Users"
  }
  inactivePage(){
    this.service.getUserInactive().subscribe(inactiveUsers => 
      {
          this.inactiveUserInfo = inactiveUsers['inactive_userlist']
          console.log(this.inactiveUserInfo);
      })
      this.displayUsers = this.inactiveUserInfo
      this.requestFlag=false;
      this.activeFlag=false;
      this.inactiveFlag=true;
      this.display_name = "Disabled Users"

  }

  addAsUser(e:any, condition_value:any) {
    e.stopPropagation();
    console.log('((((((((((((((((((((addUSer))))))))))))))))');
    let condition_column = "name"
    let updating_column = "Approval_status"
    let updating_value = "active"
    this.service.updateUser(condition_column, condition_value, updating_column, updating_value).subscribe(status_received => 
      {
          let status = status_received
          console.log("inside..................")
      })
      console.log("outside.......................")
      this.requestsPage()
  }

  disableUser(e:any, condition_value:any){
    e.stopPropagation();
    console.log('((((((((((((((((((( disable user ))))))))))))))))))');
    let condition_column = "name"
    let updating_column = "Approval_status"
    let updating_value = "disabled"
    this.service.updateUser(condition_column, condition_value, updating_column, updating_value).subscribe(status_received => 
      {
          let status = status_received
      })
    this.requestsPage()
  }
  deleteUser(e:any, condition_value:any){
    e.stopPropagation();
    console.log('(((((((((((((((((((( delete )))))))))))))))))' );
    let condition_column = "name"
    this.service.deleteUser(condition_column, condition_value).subscribe(status_received => 
      {
          let status = status_received
      })
      this.requestsPage()  
  }
 
  
}
  
  

