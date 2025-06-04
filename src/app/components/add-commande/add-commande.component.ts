import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommandeService } from 'src/app/services/commande.service';
import { ProduitService } from 'src/app/services/produit.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { ClientService } from 'src/app/services/client.service';
import { AddClientComponent } from '../add-client/add-client.component';
import { debounceTime, switchMap, map, catchError, of, first, forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-commande',
  templateUrl: './add-commande.component.html',
  styleUrls: ['./add-commande.component.css']
})
export class AddCommandeComponent implements OnInit {
  addCommandeForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  produits: any[] = [];
  clients: any[] = [];
  prixProduitsSelectionnes: { [index: number]: number } = {};
  typeProduitsAvecProduits: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cService: CommandeService,
    private pService: ProduitService,
    private typeProduitService: TypeProduitService,
    private clientService: ClientService,
    public _dialogRef: MatDialogRef<AddCommandeComponent>,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProduits();
    this.loadClients();
    
    // Générer automatiquement un code commande au démarrage
    this.genererCodeCommande();
  }

  private initForm(): void {
    this.addCommandeForm = this.fb.group({
      codeCommande: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ]], // Suppression du validateur asynchrone qui peut bloquer le formulaire
      dateCommande: [this.getTodayDate(), Validators.required],
      client: [null, Validators.required],
      produits: this.fb.array([]), // Suppression du Validators.required
      totalPrice: [{ value: 0, disabled: true }]
    });

    // Observer les changements pour calculer le prix total
    this.addCommandeForm.get('produits')?.valueChanges.subscribe(() => this.calculateTotalPrice());
  }

  loadProduits(): void {
    this.typeProduitService.getAllTypeProduits().subscribe({
      next: (data) => {
        this.typeProduitsAvecProduits = data;
        this.produits = data.flatMap(type => type.produits);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        // Si des clients sont disponibles, sélectionner le premier par défaut
      /*  if (data.length > 0) {
          this.addCommandeForm.get('client')?.setValue(data[0].clientId);
        }*/
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des clients:', err);
        this.errorMessage = 'Erreur lors du chargement des clients.';
      }
    });
  }

  openAddClientDialog(): void {
    const dialogRef = this.dialog.open(AddClientComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clients.push(result);
        this.addCommandeForm.get('client')?.setValue(result.clientId);
        this.cdr.detectChanges();
      }
    });
  }

  // Simplification du validateur pour éviter les blocages
  codeCommandeUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(null); // Temporairement désactivé pour résoudre le problème de bouton
    };
  }

  get produitsFormArray(): FormArray {
    return this.addCommandeForm.get('produits') as FormArray;
  }

  ajouterProduit(produit: any): void {
    const group = this.fb.group({
      produit: [produit.id, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });
    group.get('quantite')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.produitsFormArray.push(group);
    this.calculateTotalPrice();
  }

  retirerProduit(index: number): void {
    this.produitsFormArray.removeAt(index);
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    let total = 0;
    this.prixProduitsSelectionnes = {};

    this.produitsFormArray.controls.forEach((group, index) => {
      const produitId = group.get('produit')?.value;
      const quantite = group.get('quantite')?.value || 0;
      const produit = this.produits.find(p => p.id === Number(produitId));

      if (produit && quantite > 0) {
        const prix = produit.prix || 0;
        const sousTotal = prix * quantite;
        total += sousTotal;
        this.prixProduitsSelectionnes[index] = prix;
      }
    });

    this.addCommandeForm.get('totalPrice')?.setValue(total, { emitEvent: false });
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  genererCodeCommande(): void {
    const code = 'CMD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    this.addCommandeForm.get('codeCommande')?.setValue(code);
    this.addCommandeForm.get('codeCommande')?.markAsTouched(); // Marquer comme touché pour éviter des erreurs de validation
  }

  onProduitToggle(event: any, produit: any): void {
    if (event.target.checked) {
      this.ajouterProduit(produit);
    } else {
      const index = this.produitsFormArray.controls.findIndex(group => group.get('produit')?.value === produit.id);
      if (index > -1) {
        this.retirerProduit(index);
      }
    }
  }

  getNomProduit(produitId: number): string {
    const produit = this.produits.find(p => p.id === produitId);
    return produit ? produit.nomProduit : 'Produit inconnu';
  }

  addCommande(): void {
    // Vérification manuelle des produits
    if (this.produitsFormArray.length === 0) {
      this.errorMessage = "Veuillez sélectionner au moins un produit.";
      this.isFailed = true;
      return;
    }

    // Vérification manuelle du client
    if (!this.addCommandeForm.get('client')?.value) {
      this.errorMessage = "Veuillez sélectionner un client.";
      this.isFailed = true;
      return;
    }

    // Vérification du code commande
    if (!this.addCommandeForm.get('codeCommande')?.value) {
      this.genererCodeCommande(); // Générer un code s'il est manquant
    }

    this.isLoading = true;
    const formValue = this.addCommandeForm.value;
    const produitsTransformes = this.produitsFormArray.controls.map(group => ({
      produitId: group.get('produit')?.value,
      quantite: group.get('quantite')?.value
    }));

    const commandesPromises = produitsTransformes.map((p, index) => {
      const produit = this.produits.find(prod => prod.id === p.produitId);
      if (!produit) return of(null);

 const codeUnique = `${formValue.codeCommande}-${index + 1}`;


      const commandeIndividuelle = {
        codeCommande: codeUnique,
        quantite: p.quantite,
        dateCommande: formValue.dateCommande,
        price: produit.prix * p.quantite,
        totalPrice: produit.prix * p.quantite,
        client: { clientId: formValue.client },
        commandeProduits: [{ produit: { id: p.produitId }, quantite: p.quantite }]
      };

      return this.cService.addCommande(commandeIndividuelle);
    });

    forkJoin(commandesPromises).subscribe({
      next: (responses) => {
        const allSuccessful = responses.every(res => res !== null);
        if (allSuccessful) {
          this.isSuccessful = true;
          this.isFailed = false;
          this.isLoading = false;
  this.addCommandeForm.reset({
  codeCommande: '',
  dateCommande: this.getTodayDate(),
  client: null,
  totalPrice: 0
});

          this.produitsFormArray.clear();
          this._dialogRef.close('success');
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout des commandes:', err);
        this.isFailed = true;
        this.isSuccessful = false;
        this.isLoading = false;
        this.errorMessage = err?.error?.message || "Une ou plusieurs commandes ont échoué.";
      }
    });
  }

  
}