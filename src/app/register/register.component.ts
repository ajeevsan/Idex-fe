import { Component, OnInit } from '@angular/core';
import { state } from '@angular/animations';
import { Router } from '@angular/router';
import { LogininfoService } from '../logininfo.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  credFlag=true;
  inputName: string = "";
  inputEmail: string = "";
  inputRole: string = "";
  inputPassword: string = "";
  inputConfirmPassword: string = "";

  status:any;
  Users=[ {"username":"user","password":"user"},]
  emptyName=false;
  emptyEmail= false;
  emptyRole= false;
  emptyPassword= false;
  emptyConfirmPassword= false;
  nonMatchingPassword = false;
  // credFlag=true;
  currentDate: string = "";
  // currentDate :any;
  insertToDatabase:any[]=[];
  constructor(private router: Router,public service: LogininfoService ) {
    // this.currentDate = new Date().toString();
   }
  onSubmit() {  
    this.inputName = (<HTMLInputElement>document.getElementById("name")).value;
    this.inputEmail = (<HTMLInputElement>document.getElementById("email")).value;
    this.inputRole = (<HTMLInputElement>document.getElementById("role")).value;
    this.inputPassword = (<HTMLInputElement>document.getElementById("password")).value;
    this.inputConfirmPassword = (<HTMLInputElement>document.getElementById("confirm_password")).value;
    this.currentDate = new Date().toISOString()
    console.log(this.currentDate, typeof(this.currentDate))
    // this.currentDate = this.currentDate.toISOString()
    console.log(this.currentDate, typeof(this.currentDate))

    if(this.inputName=='')
      this.emptyName=true;
    else if(this.inputEmail=='')
      this.emptyEmail=true;
    else if(this.inputRole=='')
      this.emptyRole=true;
    else if(this.inputPassword=='')
      this.emptyPassword=true;
    else if(this.inputConfirmPassword=='')
      this.emptyConfirmPassword=true;
    else if((this.inputPassword!=this.inputConfirmPassword)||(this.inputPassword.length!=this.inputConfirmPassword.length))
    {  this.nonMatchingPassword=true;
      
    }
    else{
      console.log("here..")
      console.log(this.inputPassword, this.inputConfirmPassword)
      console.log(this.inputPassword.length,this.inputConfirmPassword.length)
      this.insertToDatabase = [this.currentDate, String(this.inputName), String(this.inputEmail), String(this.inputRole), String(this.inputConfirmPassword), String("pending")]
      console.log(this.insertToDatabase)
      this.service.registerUser(this.insertToDatabase).subscribe(status_received => 
      {
          this.status = status_received.status
          console.log("hii")
          console.log(typeof(this.status))
          if(this.status==true){
            alert("New user registered!!")
            this.router.navigateByUrl('/') 
          }
      })
      console.log("helo")
      
    }
}

  ngOnInit(): void {
  }

}
