import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CamionService } from 'src/app/services/camion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, map, catchError, of, first, forkJoin } from 'rxjs';
import { CompartimentService } from 'src/app/services/compartiment.service';
import { CiterneService } from 'src/app/services/citerne.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { Router } from '@angular/router';

interface Commande {
  idCommande: number;
  codeCommande: string;
  typeProduit: string;
  produitNom: string;
  commandeQuantite: number;
  dateCommande: Date;
  prix: number;
}

interface Compartiment {
  reference: string;
  capaciteMax: number;
  statut: string;
  typeProduits: TypeProduit[];
  capaciteRestante?: number;
  capaciteUtilisee: number;
  commandesAffectees?: Commande[];
}

export interface TypeProduit {
  id: number;
  name: string;
  description?: string;
  date?: string;
}

interface Livraison {
  id: number;
  codeLivraison: string;
  dateLivraison: string;
  camion: any;
  citerne: any;
  statut: string;
  commandes?: any[];
}

interface Citerne {
  id: number;
  reference: string;
  capacite: number;
  camionId?: number;
  compartimentTypes?: string[]; // Add this to store compartment types
}

@Component({
  selector: 'app-add-livraison',
  templateUrl: './add-livraison.component.html',
  styleUrls: ['./add-livraison.component.css']
})
export class AddLivraisonComponent implements OnInit {
  filteredCommandes: Commande[] = [];
  listeCommandes: Commande[] = [];
  commandesDejaAffectees: Set<number> = new Set();
  addLivraisonForm!: FormGroup;
  camions: any[] = [];
citernes: Citerne[] = [];
  compartiments: Compartiment[] = [];
  typeproduits: any[] = [];
  compartimentCommandesMap: { [reference: string]: Commande[] } = {};
  isSubmitting: boolean = false;
  allCamions: any[] = [];
  allCiternes: any[] = [];
  livraisons: Livraison[] = [];
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private lService: LivraisonService,
    private cService: CommandeService,
    private compartimentService: CompartimentService,
    private citerneService: CiterneService,
    private camionService: CamionService,
    private router: Router,
    private typeProduitService: TypeProduitService,
    private snackBar: MatSnackBar
  ) {
    this.minDate = this.formatDateToYYYYMMDD(new Date());
  }

  ngOnInit(): void {
    this.initForm();
    this.genererCodeLivraison();
    this.chargerCiternes();
    this.loadCamions();
    this.chargerLivraisons();

    this.addLivraisonForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        if (this.isDateInPast(date)) {
          this.addLivraisonForm.get('date')?.setErrors({ 'pastDate': true });
          this.snackBar.open('La date de livraison ne peut pas être dans le passé.', 'Fermer', { duration: 3000 });
        } else {
          this.filtrerElementsDisponibles(date);
        }
      }
    });

    // Load typeproduits and then commands
    this.typeProduitService.getAllTypeProduits().pipe(
      first(),
      catchError(err => {
        console.error('Erreur lors du chargement des typeproduits:', err);
        this.snackBar.open('Erreur lors du chargement des types de produits', 'Fermer', { duration: 3000 });
        return of([]);
      })
    ).subscribe(typeProduitsData => {
      this.typeproduits = typeProduitsData;
      this.chargerCommandes(); // Load commands only after typeproduits are available
    });

    // Subscribe to command updates
    this.cService.commandeUpdated$.subscribe(() => {
      this.chargerCommandes(); // Reload commands on update
    });
  }

private initForm(): void {
  this.addLivraisonForm = this.fb.group({
    codeLivraison: ['', [Validators.required], [this.codeLivraisonAsyncValidator()]],
    date: ['', [Validators.required, this.dateValidator()]],
    camionId: ['', [Validators.required]],
    citerneId: ['', [Validators.required]]
  });
}

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isDateInPast(dateStr: string): boolean {
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }

  private dateValidator(): ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate < today ? { 'pastDate': true } : null;
    };
  }

  private chargerCommandes(): void {
  if (!this.typeproduits || this.typeproduits.length === 0) {
    console.warn('Typeproduits not loaded yet, skipping chargerCommandes');
    return;
  }

  this.cService.getAllCommandes().pipe(
    catchError(err => {
      console.error('Erreur lors du chargement des commandes:', err);
      this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', { duration: 3000 });
      return of([]);
    })
  ).subscribe((data: any[]) => {
    data.forEach(commande => {
      // Map typeProduit from commande_produits if available
      if (commande.commandeProduits && commande.commandeProduits.length > 0) {
        const cp = commande.commandeProduits[0];
        const produit = cp.produit;
        const typeProduit = this.typeproduits.find(tp =>
          tp.produits.some((p: any) => p.id === produit.id)
        );
        if (typeProduit) {
          produit.typeProduit = typeProduit;
        }
      }
    });

    const toutesCommandes = data.map(cmd => {
      const produit = cmd.commandeProduits?.[0]?.produit;
      // Prioritize quantite from commandes table, fallback to commande_produits
      const quantite = cmd.quantite ?? cmd.commandeProduits?.[0]?.quantite ?? 0;
      return {
        idCommande: cmd.id,
        codeCommande: cmd.codeCommande,
        produitNom: produit ? produit.nomProduit : 'Nom inconnu',
        typeProduit: produit ? (produit.typeProduit?.name || produit.typeProduit || 'Type inconnu') : 'Type inconnu',
        commandeQuantite: quantite,
        dateCommande: new Date(cmd.dateCommande),
        prix: cmd.price
      };
    });

    this.listeCommandes = toutesCommandes.filter(cmd => 
      !this.commandesDejaAffectees.has(cmd.idCommande));
    
    if (this.compartiments.length > 0) {
      this.initialiserCompartimentCommandesMap();
    }
  });
}

  private chargerLivraisons(): void {
    this.lService.getAllLivraisons().pipe(
      catchError(err => {
        console.error('Erreur lors du chargement des livraisons:', err);
        this.snackBar.open('Erreur lors du chargement des livraisons', 'Fermer', { duration: 3000 });
        return of([]);
      })
    ).subscribe((data: Livraison[]) => {
      this.livraisons = data;
      this.commandesDejaAffectees.clear();
      this.livraisons.forEach(livraison => {
        if (livraison.statut !== 'ANNULE' && livraison.commandes) {
          livraison.commandes.forEach(commande => {
            this.commandesDejaAffectees.add(commande.id);
          });
        }
      });

      const dateSelectionnee = this.addLivraisonForm.get('date')?.value;
      if (dateSelectionnee) {
        this.filtrerElementsDisponibles(dateSelectionnee);
      }
      this.chargerCommandes(); // Ensure commands are reloaded after livraisons
    });
  }

  filtrerElementsDisponibles(date: string): void {
    if (!date) return;
    const dateSelectionnee = new Date(date);
    dateSelectionnee.setHours(0, 0, 0, 0);
    const camionsUtilisesParCiterne = new Map<number, Set<number>>();
    const citernesUtilisees = new Set<number>();

    this.livraisons.forEach(livraison => {
      const dateLivraison = new Date(livraison.dateLivraison);
      dateLivraison.setHours(0, 0, 0, 0);
      if (dateLivraison.getTime() === dateSelectionnee.getTime() && livraison.statut !== 'ANNULE') {
        citernesUtilisees.add(livraison.citerne.id);
        if (!camionsUtilisesParCiterne.has(livraison.camion.id)) {
          camionsUtilisesParCiterne.set(livraison.camion.id, new Set());
        }
        camionsUtilisesParCiterne.get(livraison.camion.id)!.add(livraison.citerne.id);
      }
    });

    this.citernes = this.allCiternes.filter(citerne => !citernesUtilisees.has(citerne.id));

    this.camions = this.allCamions.filter(camion => {
      const citernesCompatibles = this.allCiternes.filter(citerne => {
        return !citerne.camionId || citerne.camionId === camion.id;
      });
      return citernesCompatibles.some(citerne => !citernesUtilisees.has(citerne.id));
    });

    const currentCamionId = Number(this.addLivraisonForm.get('camionId')?.value);
    const currentCiterneId = Number(this.addLivraisonForm.get('citerneId')?.value);
    if (currentCamionId && !this.camions.some(camion => camion.id === currentCamionId)) {
      this.addLivraisonForm.get('camionId')?.setValue('');
      this.snackBar.open('Le camion sélectionné n\'est plus disponible.', 'Fermer', { duration: 3000 });
    }
    if (currentCiterneId && !this.citernes.some(citerne => citerne.id === currentCiterneId)) {
      this.addLivraisonForm.get('citerneId')?.setValue('');
      this.compartiments = [];
    }

    if (this.camions.length === 0) {
      this.snackBar.open('Aucun camion disponible à cette date.', 'Fermer', { duration: 3000 });
    }
    if (this.citernes.length === 0) {
      this.snackBar.open('Aucune citerne disponible à cette date.', 'Fermer', { duration: 3000 });
    }
  }

  private codeLivraisonAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return this.lService.checkCodeLivraisonExists(control.value).pipe(
        debounceTime(300),
        map(response => (response.exists ? { codeLivraisonExists: true } : null)),
        catchError(() => of(null)),
        first()
      );
    };
  }

  private loadCamions(): void {
    this.camionService.getCamions().pipe(
      catchError(err => {
        console.error('Erreur lors du chargement des camions:', err);
        this.snackBar.open('Erreur lors du chargement des camions', 'Fermer', { duration: 3000 });
        return of([]);
      })
    ).subscribe((data: any) => {
      this.allCamions = data;
      this.camions = [...this.allCamions];
    });
  }

private chargerCiternes(): void {
  this.citerneService.getCiternes().pipe(
    catchError(err => {
      console.error('Erreur lors du chargement des citernes:', err);
      this.snackBar.open('Erreur lors du chargement des citernes', 'Fermer', { duration: 3000 });
      return of([]);
    })
  ).subscribe(data => {
    // Map citernes and fetch their compartments
    const citernePromises = data.map((citerne: any) => {
      return this.compartimentService.getCompartimentsByCiterneId(citerne.id).pipe(
        map(compartiments => {
          const compartimentTypes = [...new Set(
            compartiments.flatMap((comp: Compartiment) =>
              comp.typeProduits.map(tp => tp.name)
            )
          )]; // Extract unique compartment types
          return { ...citerne, compartimentTypes };
        }),
        catchError(err => {
          console.error(`Erreur lors du chargement des compartiments pour la citerne ${citerne.id}:`, err);
          return of({ ...citerne, compartimentTypes: [] });
        })
      );
    });

    // Resolve all promises and update citernes
    forkJoin(citernePromises).subscribe((updatedCiternes: Citerne[]) => {
      this.allCiternes = updatedCiternes;
      this.citernes = [...this.allCiternes];
    });
  });
}

  onCiterneSelectionChange(event: any): void {
    const citerneId = event.target.value;
    if (citerneId) {
      this.compartimentService.getCompartimentsByCiterneId(citerneId).pipe(
        catchError(err => {
          console.error('Erreur lors du chargement des compartiments:', err);
          this.snackBar.open('Erreur lors du chargement des compartiments', 'Fermer', { duration: 3000 });
          return of([]);
        })
      ).subscribe(data => {
        this.compartiments = data;
        this.initialiserCompartimentCommandesMap();
      });
    } else {
      this.compartiments = [];
      this.compartimentCommandesMap = {};
    }
  }

  initialiserCompartimentCommandesMap(): void {
    this.compartimentCommandesMap = {};
    this.compartiments.forEach(compartiment => {
      this.compartimentCommandesMap[compartiment.reference] = this.filtrerEtTrierCommandes(this.listeCommandes, compartiment);
    });
  }

  filtrerEtTrierCommandes(commandes: Commande[], compartiment: Compartiment): Commande[] {
    return commandes
      .filter(cmd =>
        compartiment.typeProduits.some(tp => tp.name.toLowerCase() === cmd.typeProduit?.toLowerCase()) &&
        cmd.commandeQuantite <= (compartiment.capaciteRestante ?? compartiment.capaciteMax) &&
        !this.commandesDejaAffectees.has(cmd.idCommande) &&
        !this.isCommandeSelectedInCurrentForm(cmd.idCommande)
      )
      .sort((a, b) => {
        const dateA = new Date(a.dateCommande).getTime();
        const dateB = new Date(b.dateCommande).getTime();
        return dateA === dateB ? a.commandeQuantite - b.commandeQuantite : dateA - dateB;
      });
  }

  isCommandeSelectedInCurrentForm(commandeId: number): boolean {
    for (const compartiment of this.compartiments) {
      if (compartiment.commandesAffectees) {
        if (compartiment.commandesAffectees.some(cmd => cmd.idCommande === commandeId)) {
          return true;
        }
      }
    }
    return false;
  }

  selectCommande(compartiment: Compartiment, commande: Commande): void {
    if (!compartiment.commandesAffectees) {
      compartiment.commandesAffectees = [];
    }
    const capaciteRestante = compartiment.capaciteRestante ?? compartiment.capaciteMax;
    if (commande.commandeQuantite <= capaciteRestante) {
      compartiment.commandesAffectees.push(commande);
      compartiment.capaciteRestante = capaciteRestante - commande.commandeQuantite;
      compartiment.capaciteUtilisee = compartiment.capaciteMax - compartiment.capaciteRestante;
      this.listeCommandes = this.listeCommandes.filter(cmd => cmd.idCommande !== commande.idCommande);
      this.initialiserCompartimentCommandesMap();
    } else {
      this.snackBar.open('Capacité insuffisante pour cette commande.', 'Fermer', { duration: 3000 });
    }
  }

  

onSubmit(): void {
  if (this.addLivraisonForm.invalid) {
    if (this.addLivraisonForm.get('date')?.hasError('pastDate')) {
      this.snackBar.open('La date de livraison ne peut pas être dans le passé.', 'Fermer', { duration: 3000 });
      return;
    }
    this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
    return;
  }

  const formValue = this.addLivraisonForm.value;
  if (!formValue.camionId || !formValue.citerneId) {
    this.snackBar.open('Veuillez sélectionner un camion et une citerne.', 'Fermer', { duration: 3000 });
    return;
  }

  const selectedCamion = this.camions.find(c => c.id === Number(formValue.camionId));
  if (!selectedCamion || selectedCamion.statut !== 'Disponible') {
    this.snackBar.open('Le camion sélectionné n\'est pas disponible.', 'Fermer', { duration: 4000 });
    this.addLivraisonForm.get('camionId')?.setValue('');
    return;
  }

  const compartimentsVides = this.compartiments.filter(
    compartiment => !compartiment.commandesAffectees || compartiment.commandesAffectees.length === 0
  );

  if (compartimentsVides.length > 0) {
    this.snackBar.open('Tous les compartiments doivent avoir au moins une commande affectée.', 'Fermer', { duration: 4000 });
    return;
  }

  const selectedCommandes: Commande[] = [];
  for (const compartiment of this.compartiments) {
    if (compartiment.commandesAffectees && compartiment.commandesAffectees.length > 0) {
      selectedCommandes.push(...compartiment.commandesAffectees);
    }
  }

  if (selectedCommandes.length === 0) {
    this.snackBar.open('Veuillez affecter au moins une commande.', 'Fermer', { duration: 3000 });
    return;
  }

  const commandesDejaAffectees = selectedCommandes.filter(cmd => this.commandesDejaAffectees.has(cmd.idCommande));
  if (commandesDejaAffectees.length > 0) {
    this.snackBar.open('Certaines commandes sont déjà affectées.', 'Fermer', { duration: 3000 });
    return;
  }

  if (this.isSubmitting) return;
  this.isSubmitting = true;
  this.addLivraisonForm.disable();

  const livraisonPayload = {
    codeLivraison: formValue.codeLivraison,
    camion: { id: Number(formValue.camionId) },
    citerne: { id: Number(formValue.citerneId) },
    commandes: selectedCommandes.map((commande: Commande) => ({ id: commande.idCommande })),
    dateLivraison: formValue.date,
    statut: 'EN_ATTENTE' // Hardcode status to EN_ATTENTE
  };

  this.lService.addLivraison(livraisonPayload).subscribe({
    next: () => {
      this.snackBar.open('Livraison ajoutée avec succès.', 'Fermer', { duration: 3000 });
      selectedCommandes.forEach(cmd => this.commandesDejaAffectees.add(cmd.idCommande));
      this.chargerLivraisons();
      this.router.navigate(['/livraisons']);
    },
    error: err => {
      console.error('Erreur lors de l\'ajout de la livraison:', err);
      const errorMsg = err.error?.message || err.error;
      if (err.status === 409) {
        if (errorMsg === 'Camion non disponible à cette date') {
          this.snackBar.open('Le camion sélectionné est déjà utilisé à cette date.', 'Fermer', { duration: 4000 });
        } else if (errorMsg === 'Citerne non disponible à cette date') {
          this.snackBar.open('La citerne sélectionnée est déjà utilisée à cette date.', 'Fermer', { duration: 4000 });
        } else {
          this.snackBar.open('Conflit détecté : ' + errorMsg, 'Fermer', { duration: 4000 });
        }
      } else {
        this.snackBar.open('Une erreur est survenue.', 'Fermer', { duration: 3000 });
      }
    },
    complete: () => {
      this.isSubmitting = false;
      this.addLivraisonForm.enable();
    }
  });
}

  genererCodeLivraison(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codeLivraison = 'LIV-';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      codeLivraison += charset[randomIndex];
    }
    this.addLivraisonForm.get('codeLivraison')?.setValue(codeLivraison);
  }

  onCamionChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    const selectedCamion = this.camions.find(c => c.id === Number(selectedId));
    if (!selectedCamion) return;

    const dateLivraison = this.addLivraisonForm.value.date;
    if (!dateLivraison) {
      this.snackBar.open('Veuillez sélectionner une date avant le camion.', 'Fermer', { duration: 3000 });
      this.addLivraisonForm.get('camionId')?.setValue('');
      return;
    }

    const dejaUtilise = this.livraisons.some(l =>
      new Date(l.dateLivraison).toDateString() === new Date(dateLivraison).toDateString() &&
      l.camion?.id === selectedCamion.id &&
      l.statut !== 'ANNULE'
    );

    if (dejaUtilise) {
      this.snackBar.open(`Le camion avec l'immatriculation ${selectedCamion.immatriculation} est déjà utilisé à cette date.`, 'Fermer', { duration: 4000 });
      this.addLivraisonForm.get('camionId')?.setValue('');
    }
  }
}