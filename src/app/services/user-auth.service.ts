import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  constructor() { }
  public setRoles(roles:[]){
    localStorage.setItem("roles",JSON.stringify(roles));
  }
  public getRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }
  

  public setToken(jwtToken:string){
    localStorage.setItem("jwtToken",jwtToken);
  }
  public getToken():string | null {
    return localStorage.getItem('jwtToken');
  }
  public clear() {
    localStorage.clear();
  }
  public isLoggedIn(){
    return !!this.getToken(); 
  }
}
