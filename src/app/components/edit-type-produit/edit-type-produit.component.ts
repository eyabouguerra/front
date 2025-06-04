import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeProduitService } from 'src/app/services/type-produit.service';

@Component({
  selector: 'app-edit-type-produit',
  templateUrl: './edit-type-produit.component.html',
  styleUrls: ['./edit-type-produit.component.css']
})
export class EditTypeProduitComponent implements OnInit {
  typeProduit: any = {};
  id!: number;
  originalDate: string = '';
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private activatedRoute: ActivatedRoute,
    private pService: TypeProduitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.activatedRoute.snapshot.params['id']);
    console.log("ID récupéré depuis l'URL :", this.id);
    
    if (!this.id) {
      console.error("Erreur : ID du produit invalide !");
      return;
    }
    
    this.pService.getTypeProduitById(this.id).subscribe(
      (res) => {
        console.log('Données récupérées du backend :', res);
        if (!res) {
          console.error("Erreur : Produit introuvable !");
          return;
        }
        this.typeProduit = res;
        
        if (this.typeProduit && this.typeProduit.date) {
          const date = new Date(this.typeProduit.date);
          this.typeProduit.date = date.toISOString().split('T')[0];
          this.originalDate = this.typeProduit.date;
        }
      },
      (err) => {
        console.error('Erreur lors de la récupération du type produit :', err);
      }
    );
  }
  
  editTypeProduit() {
    this.typeProduit.date = this.originalDate;
    
    console.log("Données envoyées pour mise à jour :", this.typeProduit);
    
    this.pService.updateTypeProduit(this.typeProduit).subscribe(
      (res) => {
        console.log('Type Produit mis à jour avec succès:', res);
        
        // Afficher l'alerte de succès
        this.alertType = 'success';
        this.alertMessage = `Le type de produit "${this.typeProduit.name}" a été modifié avec succès!`;
        this.showAlert = true;
        
        // Rediriger après un délai
        setTimeout(() => {
          this.router.navigate(['/type_produit']);
        }, 2000);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du type de produit', error);
        
        // Afficher l'alerte d'erreur
        this.alertType = 'error';
        this.alertMessage = 'Une erreur est survenue lors de la mise à jour du type de produit.';
        this.showAlert = true;
      }
    );
  }
  
  closeAlert() {
    this.showAlert = false;
  }
}