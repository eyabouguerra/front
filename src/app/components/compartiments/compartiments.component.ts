import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { ChangeDetectorRef } from '@angular/core';
import { CiterneService } from 'src/app/services/citerne.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import Swal from 'sweetalert2';
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
  ) { }

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

    this.compartimentService.addCompartiment(compartimentData).subscribe(
      () => {
        this.getCompartiments();
        this.resetForm();
        Swal.fire({
          icon: 'success',
          title: 'Ajout réussi',
          text: 'Le compartiment a été ajouté avec succès !',
          confirmButtonColor: '#28a745'
        });
      },
      err => {
        Swal.fire({
          icon: 'error',
          title: 'Échec de l\'ajout',
          text: err.error.message || 'Erreur lors de l\'ajout du compartiment.',
          confirmButtonColor: '#dc3545'
        });
      }
    );
  }



  resetForm(): void {
    this.nouveauCompartiment = {
      reference: '',
      capaciteMax: null,
      typeProduits: [], // au lieu de typeProduit: null
      citerneId: this.citerneIdFromUrl
    };
  }

  getCapaciteTotaleCompartiments(): number {
    return this.compartiments.reduce((total, compartiment) => total + (compartiment.capaciteMax || 0), 0);
  }
  peutAjouterCompartiment(): boolean {
    return this.getCapaciteTotaleCompartiments() < (this.citerneDetails?.capacite || 0);
  }


  closeModal(): void {
    this.compartimentEnCours = null;
  }

  isFormValidEdit(): boolean {
    const c = this.compartimentEnCours;
    return c && c.reference && c.capaciteMax > 0 && Array.isArray(c.typeProduits) && c.typeProduits.length > 0;
  }



}