import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { LogininfoService } from '../logininfo.service';

export var loginUser:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  // loginUser:any;
  myusername: string = "";
  mypassword: string = "";
  // loginUser: string="";
  // users=[ {"username":"user","password":"user"},]
  public users:any[]=[];
  emptyPwd=false;
  emptyUsr= false;
  credFlag=true;
  public activeUserInfo:any[]=[];

  constructor(private router: Router,public service: LogininfoService ) {
    console.log("hi i am in login constructor")
    this.service.getUserActive().subscribe(activeUsers => 
      {
          this.users = activeUsers['active_userlist']
          console.log(this.users);
      })
      // this.users = this.activeUserInfo
      // console.log(this.activeUserInfo)
   }
  onSubmitLogin() {  
    this.myusername = (<HTMLInputElement>document.getElementById("txtUsrName")).value;
    this.mypassword = (<HTMLInputElement>document.getElementById("txtPwd")).value;
    if(this.myusername=='')
      this.emptyUsr=true;
    else if(this.mypassword=='')
      this.emptyPwd=true;
    else{
      console.log(this.myusername, this.mypassword)
      let cred = {"username":this.myusername,"password":this.mypassword};
      console.log(cred)
      let temp = false;
      let role = '';
      console.log("here..", this.users.length)
      for(let i=0;i<this.users.length;i++){
        console.log("here..")
        console.log(this.users[i][2],String(cred.username))
        console.log(this.users[i][5],String(cred.password))
        if(this.users[i][2]==String(cred.username) && this.users[i][5]==String(cred.password))
        {  temp=true;
          role=this.users[i][4]
          console.log(role)
          console.log("end if")
          break;
        }
        console.log("end for")
      }
      if(temp)
      {
        console.log("start if")
        console.log("login successful....!!!")
        
        if(role=='super_admin'){
          console.log("insode role sa..")
          this.router.navigateByUrl('/management' ) ; 
        }
        else{
          this.router.navigateByUrl('/home', { state: { id: this.myusername }} ) ; 
        }
        
        console.log("end if2")
      }
      else {
        this.credFlag=false
        console.log("login failed....!!!")
        alert("Login failed!!!")
      }
        
    }
}
onSubmitRegister(){
  this.router.navigateByUrl('/register') ; 
}

ngOnInit(): void {
  console.log("hi i am in login ngonint")
}

}
// console.log("end export------",loginUser)
// export var loginUser;