import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from 'src/app/model/client';
import { ClientService } from 'src/app/services/client.service';
import { CommandeService } from 'src/app/services/commande.service';
import { ProduitService } from 'src/app/services/produit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-commande',
  templateUrl: './edit-commande.component.html',
  styleUrls: ['./edit-commande.component.css']
})
export class EditCommandeComponent implements OnInit {
  commandeForm: FormGroup;
  id!: number;
  produits: any[] = [];
  nomProduitSelectionne: string = '';
  price: number = 0;
   clients: Client[] = [];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private clientService: ClientService
  ) {
  this.commandeForm = this.fb.group({
  codeCommande: ['', Validators.required],
  clientId: [null, Validators.required], // Ajouté
  produitId: ['', Validators.required],
  quantite: [1, [Validators.required, Validators.min(1)]],
  dateCommande: ['', Validators.required],
  price: ['', Validators.required]
});
  }
  getNomProduitParId(id: number): string {
    const produit = this.produits.find(p => p.id === id);
    return produit ? produit.nomProduit : '';
  }
 
  
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.loadProduits();
    this.loadCommande();
      this.loadClients();

    this.commandeForm.get('produitId')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.commandeForm.get('quantite')?.valueChanges.subscribe(() => this.calculateTotalPrice());
  }

loadClients() {
  this.clientService.getAllClients().subscribe(clients => {
    this.clients = clients;
  });
}

getClientName(clientId: number): string {
  const client = this.clients.find(c => c.clientId === clientId);
  return client ? client.fullName : 'Client inconnu';
}


  loadCommande(): void {
    this.commandeService.getCommandeById(this.id).subscribe({
      next: (commande) => {
        const produitCommande = commande.commandeProduits?.[0];
  
        this.commandeForm.patchValue({
          codeCommande: commande.codeCommande,
          produitId: produitCommande?.produit?.id || '',
          quantite: produitCommande?.quantite || 1,
          dateCommande: commande.dateCommande,
          price: commande.price,
            clientId: commande.client?.clientId || null
        });
        
        this.commandeForm.get('quantite')?.updateValueAndValidity();

        this.nomProduitSelectionne = produitCommande?.produit?.nomProduit || '';
        this.price = commande.price;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Commande introuvable.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
  

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (res) => this.produits = res,
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les produits.',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  calculateTotalPrice(): void {
    const produitId = this.commandeForm.get('produitId')?.value;
    const quantite = this.commandeForm.get('quantite')?.value;
    const produit = this.produits.find(p => p.id == produitId);

    if (produit && quantite > 0) {
      this.price = produit.prix * quantite;
      this.commandeForm.get('price')?.setValue(this.price);
    }
  }

editCommande(): void {
  if (this.commandeForm.invalid) {
    Swal.fire({
      icon: 'warning',
      title: 'Formulaire incomplet',
      text: 'Veuillez remplir tous les champs obligatoires.',
      confirmButtonColor: '#ffc107'
    });
    return;
  }

  const formValues = this.commandeForm.getRawValue();

  // Préparer l'objet commande avec le client
  const commandeToUpdate = {
    id: this.id,
    codeCommande: formValues.codeCommande,
    dateCommande: formValues.dateCommande,
    quantite: formValues.quantite,
    price: this.price,
    client: formValues.clientId ? { clientId: formValues.clientId } : null,
    commandeProduits: [{
      produit: { id: formValues.produitId },
      quantite: formValues.quantite
    }]
  };

  this.commandeService.updateCommande(commandeToUpdate).subscribe({
    next: (updatedCommande) => {
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Commande mise à jour avec succès !',
        confirmButtonColor: '#198754'
      }).then(() => {
        this.router.navigate(['/commandes']);
      });
    },
    error: (error) => {
      console.error('Erreur lors de la mise à jour:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Échec de la mise à jour de la commande.',
        confirmButtonColor: '#dc3545'
      });
    }
  });
}
  
}
