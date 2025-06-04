import { Component, OnInit } from '@angular/core';
import { LivraisonService } from 'src/app/services/livraison.service'; // ajuste le chemin si besoin
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-suivre-livraison',
  templateUrl: './suivre-livraison.component.html',
  styleUrls: ['./suivre-livraison.component.css']
})
export class SuivreLivraisonComponent implements OnInit {
  livraisons: any[] = [];
  username: string = '';
  
  // Nouvelle propriété pour stocker les livraisons avec commandes filtrées
  livraisonsFiltres: any[] = [];

  constructor(private lService: LivraisonService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    console.log("Nom d'utilisateur :", this.username);
  
    if(this.username) {
      this.getLivraisons();
    } else {
      console.error("Username non défini !");
    }
  }
  
  getLivraisons(): void {
    this.lService.getLivraisonsByUser(this.username).subscribe({
      next: (data) => {
        console.log("Data brute reçue:", data);
        this.livraisons = data;
        console.log(this.livraisons[0].commandes[0]);

        // Pour chaque livraison, on filtre ses commandes pour ne garder que celles du user connecté
        this.livraisonsFiltres = this.livraisons.map(livraison => {
          const commandesFiltrees = livraison.commandes.filter((cmd: any) => cmd.user?.userName === this.username
        );

          return {
            ...livraison,
            commandes: commandesFiltrees
          };
        })
        // On peut aussi retirer les livraisons sans commande pour cet utilisateur
        .filter(livraison => livraison.commandes.length > 0);
  
        console.log("Livraisons filtrées à afficher:", this.livraisonsFiltres);
      },
      error: (err) => {
        console.error('Erreur :', err);
      }
    });
  }
  
}  


