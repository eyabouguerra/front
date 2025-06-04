import { Component, OnInit } from '@angular/core';
import { CiterneService } from 'src/app/services/citerne.service';
import { CamionService } from 'src/app/services/camion.service';
import Swal from 'sweetalert2';

interface Compartiment {
  id: number;
  reference: string;
  capaciteMax: number;
  statut: string;
}

@Component({
  selector: 'app-citernes',
  templateUrl: './citernes.component.html',
  styleUrls: ['./citernes.component.css']
})
export class CiternesComponent implements OnInit {
  currentPage: number = 1;
  itemsPerPage: number = 4;

  citernes: any[] = [];
  compartiments: Compartiment[] = [];
  searchReference: string = '';
  citernesFiltres: any[] = [];
  nouvelleCiterne = {
    reference: '',
    capacite: null,
    nombreCompartiments: null,
    compartiments: [] as Compartiment[],
  };
  citerneEnCours: any = null;
  isModalOpen: boolean = false;
  selectedCompartiments: number[] = [];

  constructor(
    private citerneService: CiterneService,
    private camionService: CamionService
  ) { }

  ngOnInit(): void {
    this.getCiternes();

  }



  // Fetch citernes from backend
  getCiternes(): void {
    this.citerneService.getCiternes().subscribe(
      (data) => {
        console.log('Citernes récupérées:', data);
        this.citernes = data;
        this.citernesFiltres = data; // Initialisation de la liste filtrée
      },
      (error) => {
        console.error('Erreur lors de la récupération des citernes:', error);
        alert('Erreur lors de la récupération des citernes.');
      }
    );
  }
  filtrerCiternes(): void {
    const search = this.searchReference.trim().toLowerCase();
    if (!search) {
      this.citernesFiltres = this.citernes;
      return;
    }

    this.citernesFiltres = this.citernes.filter(citerne =>
      citerne.reference?.toLowerCase().includes(search) ||
      citerne.capacite?.toString().toLowerCase().includes(search) ||
      citerne.nombreCompartiments?.toString().toLowerCase().includes(search)
    );
  }


  // Add a new citerne
  ajouterCiterne(): void {
    if (!this.nouvelleCiterne.reference || !this.nouvelleCiterne.capacite || !this.nouvelleCiterne.nombreCompartiments) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs manquants',
        text: 'Veuillez remplir tous les champs.',
        confirmButtonColor: '#f0ad4e'
      });
      return;
    }

    const citerneData = {
      reference: this.nouvelleCiterne.reference,
      capacite: this.nouvelleCiterne.capacite,
      nombreCompartiments: this.nouvelleCiterne.nombreCompartiments,
    };

    this.citerneService.addCiterne(citerneData).subscribe(
      (data) => {
        setTimeout(() => {
          this.getCiternes();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Citerne ajoutée avec succès.',
            confirmButtonColor: '#28a745'
          });
        }, 1000);
        this.resetForm();
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de la citerne:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'ajout de la citerne.',
          confirmButtonColor: '#dc3545'
        });
      }
    );
  }





  genererCodeCiterne(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    let isUnique = false;
    const prefix = 'CIT-';

    while (!isUnique) {
      code = prefix;
      for (let i = 0; i < 10; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      // Vérifie l'unicité par rapport aux références existantes
      isUnique = !this.compartiments.some(c => c.reference === code);
    }

    this.nouvelleCiterne.reference = code;
  }
  // Delete a citerne
  supprimerCiterne(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette citerne ?')) {
      this.citerneService.deleteCiterne(id).subscribe(
        () => {
          this.getCiternes();
        },
        (error) => {
          console.error('Erreur lors de la suppression de la citerne:', error);
          alert('Une erreur est survenue lors de la suppression de la citerne.');
        }
      );
    }
  }

  // Reset the form
  resetForm(): void {
    this.nouvelleCiterne = {
      reference: '',
      capacite: null,
      nombreCompartiments: null,
      compartiments: []
    };
  }


  // Close the modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  compartimentsDisponibles(): Compartiment[] {
    const idsUtilises = this.citernes.flatMap(c =>
      c.compartiments.map((comp: Compartiment) => comp.id)
    );
    return this.compartiments.filter((c: Compartiment) => !idsUtilises.includes(c.id));
  }



}