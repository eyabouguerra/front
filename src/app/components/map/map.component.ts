import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';

@Component({
  selector: 'app-map',
  template: `<div id="map" style="height: 500px;"></div>`
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  private marker!: L.Marker;
  commandeId!: number;

  constructor(private route: ActivatedRoute, private lService: LivraisonService) {}

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.params['id'];
    this.initMap();
    this.loadPosition();
    setInterval(() => this.loadPosition(), 5000);
  }

  private initMap(): void {
    this.map = L.map('map').setView([48.8566, 2.3522], 13); // coords Paris par défaut

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadPosition(): void {
    this.lService.getLivreurPosition(this.commandeId).subscribe(pos => {
      if (!this.marker) {
        this.marker = L.marker([pos.lat, pos.lng]).addTo(this.map).bindPopup('Livreur');
      } else {
        this.marker.setLatLng([pos.lat, pos.lng]);
      }
      this.map.setView([pos.lat, pos.lng], 15);
    }, err => {
      console.error('Erreur récupération position livreur', err);
    });
  }
}
