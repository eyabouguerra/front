import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-admin',
  templateUrl: './signup-admin.component.html',
  styleUrls: ['./signup-admin.component.css']
})
export class SignupAdminComponent implements OnInit {
  type: string="password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  signUpForm!: FormGroup;
  constructor(private fb : FormBuilder){}
  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      firstName: new FormControl('', [ Validators.required]),
      lastName: new FormControl('', [ Validators.required]),
      username: new FormControl('', [ Validators.required]),
      email: new FormControl('', Validators.email),
      password: new FormControl('', [ Validators.required]),
    })
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
}}
