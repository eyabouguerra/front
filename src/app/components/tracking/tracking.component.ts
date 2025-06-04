import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private marker!: L.Marker;
  private intervalId: any;
  commandeId!: number;

  constructor(private route: ActivatedRoute, private lService: LivraisonService) {}

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.params['id'];
    this.initMap();
    this.loadPosition();
    this.intervalId = setInterval(() => this.loadPosition(), 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.map) this.map.remove(); // Nettoyer la carte
  }

  private initMap(): void {
    this.map = L.map('map').setView([36.8065, 10.1815], 13); // Coord par défaut : Tunis

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadPosition(): void {
    this.lService.getLivreurPosition(this.commandeId).subscribe(
      pos => {
        if (!this.marker) {
          this.marker = L.marker([pos.lat, pos.lng]).addTo(this.map).bindPopup('Livreur');
        } else {
          this.marker.setLatLng([pos.lat, pos.lng]);
        }
        this.map.setView([pos.lat, pos.lng], 15);
      },
      err => {
        console.error('Erreur récupération position livreur', err);
      }
    );
  }
}
