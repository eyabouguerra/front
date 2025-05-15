import { Component, OnInit } from '@angular/core';
import { CiterneService } from 'src/app/services/citerne.service';
import { CamionService } from 'src/app/services/camion.service';

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
  citernes: any[] = [];
  compartiments: Compartiment[] = [];
  nouvelleCiterne = {
    reference: '',
    capacite: null,
    nombreCompartiments:  null,
    compartiments: [] as Compartiment[],
  };
  citerneEnCours: any = null;
  isModalOpen: boolean = false;
  selectedCompartiments: number[] = [];

  constructor(
    private citerneService: CiterneService,
    private camionService: CamionService
  ) {}

  ngOnInit(): void {
    this.getCiternes();
    
  }

  

  // Fetch citernes from backend
  getCiternes(): void {
    this.citerneService.getCiternes().subscribe(
      (data) => {
        console.log('Citernes récupérées:', data);
        this.citernes = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des citernes:', error);
        alert('Erreur lors de la récupération des citernes.');
      }
    );
  }
  // Add a new citerne
  ajouterCiterne(): void {
    if (!this.nouvelleCiterne.reference || !this.nouvelleCiterne.capacite || !this.nouvelleCiterne.nombreCompartiments) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    const citerneData = {
      reference: this.nouvelleCiterne.reference,
      capacite: this.nouvelleCiterne.capacite,
      nombreCompartiments: this.nouvelleCiterne.nombreCompartiments,
    };
    console.log('Valeur de nombreCompartiments :', this.nouvelleCiterne.nombreCompartiments);
console.log('Données envoyées au backend :', citerneData);

    this.citerneService.addCiterne(citerneData).subscribe(
      (data) => {
        // Attendre un peu avant de récupérer les citernes, pour s'assurer que la nouvelle citerne est ajoutée
        setTimeout(() => {
          this.getCiternes(); // Rafraîchit la liste des citernes
          alert('Citerne ajoutée avec succès.');
        }, 1000); // Attendre 1 seconde (vous pouvez ajuster ce délai selon vos besoins)
        this.resetForm();
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de la citerne:', error);
        alert('Erreur lors de l\'ajout de la citerne.');
      }
    );
  }

  // Edit an existing citerne
  editCiterne(id: number): void {
    console.log('Editing citerne with ID:', id);
    this.citerneService.getCiterne(id).subscribe(
      (data) => {
        if (data && data.id) {
          this.citerneEnCours = data;
          this.selectedCompartiments = this.citerneEnCours.compartiments.map((comp: any) => comp.id);
          this.isModalOpen = true;
        } else {
          alert('Citerne non trouvée');
        }
      },
      (error) => {
        console.error('Error fetching citerne:', error);
        alert('Erreur lors de la récupération de la citerne.');
      }
    );
  }

  // Save citerne modifications
// Save citerne modifications
sauvegarderModification(): void {
  if (!this.citerneEnCours || !this.citerneEnCours.id) {
    alert('ID de la citerne invalide.');
    return;
  }

  if (!this.citerneEnCours.reference || !this.citerneEnCours.capacite) {
    alert('Veuillez remplir tous les champs valides.');
    return;
  }

  if (this.selectedCompartiments.length === 0) {
    alert('Veuillez sélectionner au moins un compartiment.');
    return;
  }

  // Calculer la capacité totale des compartiments sélectionnés
  const capaciteTotaleCompartiments = this.selectedCompartiments.reduce((total, id) => {
    const compartiment = this.compartiments.find(comp => comp.id === id);
    if (compartiment) {
      return total + compartiment.capaciteMax;
    }
    return total;
  }, 0);

  // Vérifier si la capacité totale des compartiments dépasse la capacité de la citerne
  if (capaciteTotaleCompartiments > this.citerneEnCours.capacite) {
    alert('La capacité totale des compartiments sélectionnés dépasse la capacité de la citerne.');
    return;
  }

  // Si tout est correct, on crée l'objet à envoyer au backend
  const compartimentsSelectionnes = this.selectedCompartiments.map(id => ({ id }));

  const citerneToSend = {
    id: this.citerneEnCours.id,
    reference: this.citerneEnCours.reference,
    capacite: this.citerneEnCours.capacite,
    compartiments: compartimentsSelectionnes
  };

  // Appeler le service pour mettre à jour la citerne
  this.citerneService.updateCiterne(citerneToSend).subscribe(
    () => {
      this.getCiternes();
      this.closeModal();
    },
    (error) => {
      console.error('Erreur lors de la sauvegarde de la citerne:', error);
      alert('Une erreur est survenue lors de la modification de la citerne.');
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