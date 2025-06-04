import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-gestion-dispatcheur',
  templateUrl: './gestion-dispatcheur.component.html',
  styleUrls: ['./gestion-dispatcheur.component.css']
})
export class GestionDispatcheurComponent implements OnInit{


  alldispatcheurs : any = [];
  searchText: string = '';
  filteredDispatcheurs: any[] = [];
  page: number = 1; // page actuelle
  itemsPerPage: number = 5;
  
  constructor(
    private uService :UserService,
    private router:Router
  ) {}

  ngOnInit() {
    this.loadDispatcheurs();
  }
  loadDispatcheurs() {
    this.uService.getUsersByRole("Dispatcheur").subscribe(
      data => {
        this.filteredDispatcheurs = data;
        this.alldispatcheurs = data;
      },
      err => {
        console.error("Erreur lors du chargement des dispachers : ", err);
      }
    );
  }
  filterDispatcheurs() {
    this.filteredDispatcheurs = this.alldispatcheurs.filter((admin: any) =>
      admin.userFirstName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      admin.userLastName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      admin.userName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      admin.email?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
   deleteDispatcheur(userName: string) {
      Swal.fire({
        title: '❗ Confirmation',
        text: `Voulez-vous vraiment supprimer "${userName}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.uService.deleteUser(userName).subscribe({
            next: (response) => {
              // Suppression réussie
              Swal.fire('✅ Supprimé', `L'utilisateur "${userName}" a été supprimé.`, 'success');
              this.loadDispatcheurs(); // Rafraîchir la liste
            },
            error: (error) => {
              // Si le status est 200, considérer que c'est OK malgré l'erreur (souvent un bug du backend)
              if (error.status === 200) {
                Swal.fire('✅ Supprimé', `L'utilisateur "${userName}" a été supprimé.`, 'success');
                this.loadDispatcheurs();
              } else {
                console.error('Erreur lors de la suppression : ', error);
                Swal.fire('❌ Erreur', error.error || 'Échec de la suppression', 'error');
              }
            }
          });
        }
      });
    }
   
  }

 
