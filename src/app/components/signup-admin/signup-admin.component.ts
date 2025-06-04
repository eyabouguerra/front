import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup-admin',
  templateUrl: './signup-admin.component.html',
  styleUrls: ['./signup-admin.component.css']
})
export class SignupAdminComponent implements OnInit {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  roles: string[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getAllRoles().subscribe({
      next: (roles: string[]) => {
        console.log('Rôles récupérés:', roles);
        this.roles = roles;
      },
      error: (error: any) => {
        console.error("Erreur lors de la récupération des rôles:", error);
      }
    });
  }

  hideShowPass(): void {
    this.isText = !this.isText;
    this.eyeIcon = this.isText ? "fa-eye" : "fa-eye-slash";
    this.type = this.isText ? "text" : "password";
  }

  register(registerForm: NgForm): void {
    if (registerForm.invalid) {
      Swal.fire({
        title: 'Champs manquants ❗',
        text: 'Veuillez remplir tous les champs requis.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e74c3c'
      });
      return;
    }
  
    const formData = registerForm.form.value;
  
    // Adapter le rôle à un tableau
    formData.roles = [formData.role];
    delete formData.role;
  
    this.userService.register(formData).subscribe(
      () => {
        const date = new Date();
        const heure = date.toLocaleTimeString();
        const jour = date.toLocaleDateString();
  
        Swal.fire({
          title: '🎉 Inscription réussie !',
          html: `
            <p>Date : <strong>${jour}</strong></p>
            <p>Heure : <strong>${heure}</strong></p>
          `,
          icon: 'success',
          confirmButtonText: 'Super !',
          confirmButtonColor: '#3085d6',
          background: '#f0f8ff',
          color: '#333',
          customClass: {
            popup: 'animated fadeInDown faster'
          }
        }).then(() => {
          registerForm.resetForm();
        });
      },
      (error) => {
        console.error("❌ Erreur lors de l'inscription :", error);
        Swal.fire({
          title: 'Erreur 😓',
          text: 'Une erreur est survenue pendant l’inscription.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }
  
  
  
  
}     