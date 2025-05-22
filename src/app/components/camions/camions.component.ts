import { Component, OnInit } from '@angular/core';
import { CamionService } from 'src/app/services/camion.service';

import Swal from 'sweetalert2';
@Component({
  selector: 'app-camions',
  templateUrl: './camions.component.html',
  styleUrls: ['./camions.component.css']
})
export class CamionsComponent implements OnInit {
  camions: any[] = [];
  statuts: string[] = ['Disponible', 'En maintenance', 'En livraison', 'Hors service'];
 

  
  nouveauCamion = {
    id: 0,
    marque: '',
    modele: '',
    immatriculation: '',
    kilometrage: null,
    statut: 'Disponible',
    
  };

  camionEnCours: any = null;

  constructor(
    private camionService: CamionService,
   
  ) {}
  

  ngOnInit(): void {
        this.loadCamions(); 
    
  }

  loadCamions(): void {
    this.camionService.getCamions().subscribe(
      (data) => {
        this.camions = data; // 👈 ajout obligatoire pour afficher les camions
        console.log('Camions:', data);
      },
      (error) => {
        console.error('Erreur lors du chargement des camions:', error);
      }
    );
  }
  
 
  
  

  isFormValid(): boolean {
    return !!(this.nouveauCamion.marque && this.nouveauCamion.modele && this.nouveauCamion.immatriculation &&
              /*this.nouveauCamion.kilometrage > 0 &&*/ this.nouveauCamion.statut );
  }

ajouterCamion() {
  if (!this.isFormValid()) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  if (!this.checkImmatriculationUnique(this.nouveauCamion.immatriculation)) {
    Swal.fire('Erreur', 'Cette immatriculation est déjà utilisée par un autre camion', 'error');
    return;
  }

  const camionData = {
    ...this.nouveauCamion,
  };

  this.camionService.addCamion(camionData).subscribe(
    (data) => {
      this.camions.push(data);
      this.nouveauCamion = {
        id: 0,
        marque: '',
        modele: '',
        immatriculation: '',
        kilometrage: null,
        statut: 'Disponible',
      };
      Swal.fire('Succès', 'Camion ajouté avec succès', 'success');
    },
    (error) => {
      console.error("Erreur lors de l'ajout du camion:", error);
      Swal.fire('Erreur', "Une erreur s'est produite lors de l'ajout", 'error');
    }
  );
}
  

  supprimerCamion(id: number) {
    const camion = this.camions.find(c => c.id === id);
    if (camion) {
      Swal.fire({
        title: `Êtes-vous sûr de vouloir supprimer ?`,
        text: `Camion: ${camion.marque} - ${camion.immatriculation}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.camionService.deleteCamion(id).subscribe(
            () => {
              this.camions = this.camions.filter(c => c.id !== id);
              
              Swal.fire({
                title: 'Supprimé !',
                text: 'Le camion a été supprimé avec succès.',
                icon: 'success',
                confirmButtonColor: '#28a745'
              });
            },
            (error) => {
              console.error("Erreur lors de la suppression du camion:", error);
              Swal.fire({
                title: 'Erreur !',
                text: "Une erreur s'est produite lors de la suppression.",
                icon: 'error',
                confirmButtonColor: '#d33'
              });
            }
          );
        }
      });
    } else {
      Swal.fire({
        title: 'Erreur !',
        text: "Camion introuvable.",
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  } 
 
  

sauvegarderModification() {
  if (!this.camionEnCours.marque || !this.camionEnCours.modele || 
      !this.camionEnCours.immatriculation || this.camionEnCours.kilometrage <= 0) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs valides', 'error');
    return;
  }

  if (!this.checkImmatriculationUnique(this.camionEnCours.immatriculation, this.camionEnCours.id)) {
    Swal.fire('Erreur', 'Cette immatriculation est déjà utilisée par un autre camion', 'error');
    return;
  }

  const camionModifie = {
    ...this.camionEnCours,
  };

  this.camionService.updateCamion(camionModifie).subscribe(
    () => {
      this.loadCamions();
      this.closeModal();
      Swal.fire('Succès', 'Camion modifié avec succès', 'success');
    },
    (error) => {
      console.error('Erreur lors de la mise à jour du camion:', error);
      Swal.fire('Erreur', "Une erreur est survenue lors de la modification", 'error');
    }
  );
}

  editCamion(id: number): void {
  this.camionService.getCamion(id).subscribe(data => {
    this.camionEnCours = data;
    console.log('Fetched camion:', this.camionEnCours);


    const modal = document.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'block'; 
    }
  });
}

// Ajoutez cette méthode dans votre composant
checkImmatriculationUnique(immatriculation: string, excludeId: number = 0): boolean {
  return !this.camions.some(c => 
    c.immatriculation === immatriculation && c.id !== excludeId
  );
}

  closeModal() {
    this.camionEnCours = null;
  }
}
