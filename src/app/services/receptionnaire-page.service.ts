import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionnairePageService {

  
  private typeproduitURL = 'http://localhost:8080/api'; // Remplace par ton URL d'API

  constructor(private http: HttpClient) {}

  getAllProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.typeproduitURL}/produits/v1`);
  }
  getAllTypeProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.typeproduitURL}/typeproduits/v1`);
  }
  

  getAllCommandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.typeproduitURL}/commandes/v1`);
  }

  getCalendarEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.typeproduitURL}/livraisons`);
  }
}
