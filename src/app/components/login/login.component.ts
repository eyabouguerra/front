import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserAuthService } from '../../services/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  type: string="password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  loginForm!: FormGroup;
  constructor(private fb : FormBuilder,private userService:UserService,
    private userAuthService:UserAuthService,
    private router:Router){}
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      firstName: new FormControl('', [ Validators.required]),
      lastName: new FormControl('', [ Validators.required]),
      userName: new FormControl('', [ Validators.required]),
      email: new FormControl('', Validators.email),
      userPassword: new FormControl('', [ Validators.required]),
    })
  }

  login(loginForm: NgForm) {
    this.userService.login(loginForm.value).subscribe(
      (response: any) => {
        console.log("Contenu user :", response.user);
  
        // Stocker le username dans le localStorage
        if(response.user && response.user.userName) {
          localStorage.setItem('username', response.user.userName);
        }
  
        if (response?.user?.role?.length > 0) {
          this.userAuthService.setRoles(response.user.role);
          this.userAuthService.setToken(response.jwtToken);
          localStorage.setItem(
            'roles',
            JSON.stringify(response.user.role.map((r: { roleName: string }) => r.roleName))
          );
          const role = response.user.role[0].roleName;
  
          if (role === 'Admin') {
            this.router.navigate(['/adminpage']);
          } else if (role === 'Dispatcheur')  {
            this.router.navigate(['/receptionnairepage']);
          } else {
            this.router.navigate(['/categories']);
          }
        } else {
          console.error("Rôle utilisateur manquant ou vide :", response);
          alert("Erreur de connexion : rôle utilisateur non trouvé.");
        }
      },
      (error) => {
        console.error("Erreur lors du login :", error);
        alert("Échec de connexion. Vérifiez vos identifiants.");
      }
    );
  }
  
  hideShowPass(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }
 
  private validateAllFormFileds(formGroup:FormGroup){
    Object.keys(formGroup.controls).forEach(field=> {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFileds(control)
      }
    })
}

}
