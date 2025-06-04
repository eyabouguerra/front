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
  camionsFiltres: any[] = []; 
  searchTerm: string = ''; 
  page: number = 1;
  itemsPerPage: number = 5;
  
  nouveauCamion = {
    id: 0,
    marque: '',
    modele: '',
    immatriculation: '',
    kilometrage: null,
    statut: '',
    
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
        this.camions = data;
        this.camionsFiltres = data; // Initialisation avec tous les camions
      },
      (error) => {
        console.error('Erreur lors du chargement des camions:', error);
      }
    );
  }
  

  filtrerCamions(): void {
    const term = this.searchTerm.toLowerCase();

    this.camionsFiltres = this.camions.filter(camion => {
      return (
        camion.marque.toLowerCase().includes(term) ||
        camion.modele.toLowerCase().includes(term) ||
        camion.statut.toLowerCase().includes(term) ||
        camion.immatriculation.toLowerCase().includes(term)
      );
    });
  }
 
  
  

  isFormValid(): boolean {
    return !!(this.nouveauCamion.marque && this.nouveauCamion.modele && this.nouveauCamion.immatriculation &&
              /*this.nouveauCamion.kilometrage > 0 &&*/ this.nouveauCamion.statut );
  }

ajouterCamion() {
  if (this.isFormValid()) {
    const immatriculationExist = this.camions.some(
      (camion) => camion.immatriculation.toLowerCase() === this.nouveauCamion.immatriculation.toLowerCase()
    );

    if (immatriculationExist) {
      Swal.fire({
        title: 'Doublon !',
        text: "Un camion avec cette immatriculation existe déjà.",
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
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
          statut: '',
        };
        Swal.fire({
          title: 'Ajouté !',
          text: 'Le camion a été ajouté avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      (error) => {
        console.error("Erreur lors de l'ajout du camion:", error);
        Swal.fire({
          title: 'Erreur !',
          text: "Une erreur s'est produite lors de l'ajout.",
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    );
  }
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
              this.loadCamions(); // <-- actualise la table ici
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
  if (!this.camionEnCours.marque || !this.camionEnCours.modele || !this.camionEnCours.immatriculation || this.camionEnCours.kilometrage <= 0) {
    alert('Veuillez remplir tous les champs valides.');
    return;
  }

  // Vérifier si une autre immatriculation existe déjà
  const duplicate = this.camions.some(camion =>
    camion.id !== this.camionEnCours.id &&
    camion.immatriculation.toLowerCase() === this.camionEnCours.immatriculation.toLowerCase()
  );

  if (duplicate) {
    Swal.fire({
      title: 'Doublon !',
      text: "Un autre camion avec cette immatriculation existe déjà.",
      icon: 'warning',
      confirmButtonColor: '#ffc107'
    });
    return;
  }

  const camionModifie = {
    ...this.camionEnCours,
  };

  this.camionService.updateCamion(camionModifie).subscribe(
    () => {
      this.loadCamions();
      this.closeModal();
    },
    (error) => {
      console.error('Erreur lors de la mise à jour du camion:', error);
      alert("Une erreur est survenue lors de la modification du camion.");
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


  closeModal() {
    this.camionEnCours = null;
  }
}