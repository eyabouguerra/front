import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { ChangeDetectorRef } from '@angular/core';
import { CiterneService } from 'src/app/services/citerne.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';

@Component({
  selector: 'app-compartiments',
  templateUrl: './compartiments.component.html',
  styleUrls: ['./compartiments.component.css']
})
export class CompartimentsComponent implements OnInit {
  citerneIdFromUrl: number | null = null;
  citerneDetails: any = null;
  compartiments: any[] = [];
  typesProduits: { id: number, name: string }[] = [];

nouveauCompartiment: any = {
  reference: '',
  capaciteMax: null,
  typeProduits: [],  // tableau au lieu d'un seul produit
  citerneId: null
};

  compartimentEnCours: any = null;

  constructor(
    private compartimentService: CompartimentService,
    private citerneService: CiterneService,
    private typeProduitService: TypeProduitService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idCiterne');
    if (id) {
      this.citerneIdFromUrl = +id;
      this.nouveauCompartiment.citerneId = this.citerneIdFromUrl;
      this.loadInitialData();
    } else {
      alert('ID de la citerne manquant dans l’URL.');
      this.router.navigate(['/']);
    }
  }

  loadInitialData(): void {
    this.getCiterne();
    this.getCompartiments();
    this.getTypesProduits();
  }

  getCiterne(): void {
    if (this.citerneIdFromUrl) {
      this.citerneService.getCiterne(this.citerneIdFromUrl).subscribe({
        next: (data) => this.citerneDetails = data,
        error: () => alert('Erreur lors de la récupération de la citerne.')
      });
    }
  }

  getCompartiments(): void {
    if (this.citerneIdFromUrl) {
      this.compartimentService.getCompartimentsByCiterneId(this.citerneIdFromUrl).subscribe({
        next: (data) => this.compartiments = Array.isArray(data) ? data : [],
        error: () => alert('Erreur lors de la récupération des compartiments.')
      });
    }
  }

  getTypesProduits(): void {
    this.typeProduitService.getAllTypeProduits().subscribe({
      next: (types) => {
        this.typesProduits = types.map((type: any) => ({ id: type.id, name: type.name })); 
        this.cdr.detectChanges();
      },
      error: () => alert('Erreur lors de la récupération des types de produits.')
    });
  }

  
genererCodeCompartiment(): void {
  if (this.compartiments.length >= this.citerneDetails?.nombreCompartiments) {
    alert('Nombre maximal de compartiments atteint. Vous ne pouvez pas en ajouter d\'autres.');
    return;
  }

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'COMP-';
  let code = '';
  let isUnique = false;

  while (!isUnique) {
    code = prefix + Array.from({ length: 10 }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join('');
    isUnique = !this.compartiments.some(c => c.reference === code);
  }

  this.nouveauCompartiment.reference = code;
}


ajouterCompartiment() {
  const compartimentData = {
    reference: this.nouveauCompartiment.reference,
    capaciteMax: this.nouveauCompartiment.capaciteMax,
    citerne: { id: this.citerneIdFromUrl },
    typeProduits: this.nouveauCompartiment.typeProduits
  };

  this.compartimentService.addCompartiment(compartimentData).subscribe(() => {
    this.getCompartiments();
    this.resetForm();
  }, err => {
    alert(err.error.message || 'Erreur lors de l\'ajout');
  });
}


resetForm(): void {
  this.nouveauCompartiment = {
    reference: '',
    capaciteMax: null,
    typeProduits: [], // au lieu de typeProduit: null
    citerneId: this.citerneIdFromUrl
  };
}


  editCompartiment(id: number): void {
    this.compartimentService.getCompartiment(id).subscribe({
      next: (data) => this.compartimentEnCours = { ...data },
      error: () => alert('Erreur lors du chargement du compartiment.')
    });
  }

  sauvegarderModification(): void {
    const comp = this.compartimentEnCours;

    if (!this.isFormValidEdit()) {
      alert('Veuillez remplir tous les champs valides.');
      return;
    }

    this.citerneService.getCiterne(this.citerneIdFromUrl!).subscribe({
      next: (citerne) => {
        if (comp.capaciteMax > citerne.capacite) {
          alert('Capacité du compartiment > capacité de la citerne.');
          return;
        }

        const payload = {
          ...comp,
          citerne: { id: this.citerneIdFromUrl }
        };

        this.compartimentService.updateCompartiment(payload).subscribe({
          next: () => {
            alert('Compartiment modifié.');
            this.getCompartiments();
            this.closeModal();
          },
          error: () => alert('Erreur lors de la modification.')
        });
      },
      error: () => alert('Erreur lors de la vérification de la citerne.')
    });
  }

  supprimerCompartiment(id: number): void {
    if (!confirm('Confirmez la suppression ?')) return;

    this.compartimentService.deleteCompartiment(id).subscribe({
      next: () => {
        alert('Compartiment supprimé.');
        this.getCompartiments();
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  closeModal(): void {
    this.compartimentEnCours = null;
  }

isFormValidEdit(): boolean {
  const c = this.compartimentEnCours;
  return c && c.reference && c.capaciteMax > 0 && Array.isArray(c.typeProduits) && c.typeProduits.length > 0;
}



}