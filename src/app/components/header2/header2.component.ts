import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthService } from 'src/app/services/user-auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.css']
})
export class Header2Component implements OnInit {
  constructor(private userAuthService: UserAuthService,
    private router:Router,
    private userService: UserService   
  ){

  }
  ngOnInit(): void {
    
  }
  public isLoggedIn(){
    return this.userAuthService.isLoggedIn();
  }
  public logout(){
    this.userAuthService.clear();
    this.router.navigate(['']);
  }
}
