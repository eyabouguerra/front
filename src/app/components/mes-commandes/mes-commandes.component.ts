import { Component, OnInit } from '@angular/core';
import { CommandeService } from 'src/app/services/commande.service';

@Component({
  selector: 'app-mes-commandes',
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.css']
})
export class MesCommandesComponent implements OnInit {
  currentDate: Date = new Date();
  commandes: any[] = [];
  allMesCommandes: any[] = [];
  searchTerm: string = ''; // ce que l'utilisateur tape
  filteredMesCommandes: any[] = [];
  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.commandeService.getCommandesByUser().subscribe({
      next: (data) =>{
        this.commandes = data,
        this.allMesCommandes = data;
        this.filteredMesCommandes= data;

      } ,
      error: (err) => console.error('Erreur chargement commandes:', err)
    });
  }

  filterMesCommandes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredMesCommandes = this.allMesCommandes.filter((commande: any) =>
      commande.codeCommande?.toLowerCase().includes(term) ||
      commande.client?.fullName?.toLowerCase().includes(term) ||
      commande.commandeProduits?.some((cp: any) =>
        cp.produit?.nomProduit?.toLowerCase().includes(term)
      )
    );
  }
  
  
}