import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CamionService {

  private apiUrl = 'http://localhost:8090/api/camions'; // URL de ton API backend

  constructor(private http: HttpClient) { }

  // Récupérer tous les camions
  getCamions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getCamion(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  isCamionReservedForDate(camionId: number, date: string): Observable<boolean> {
    return this.http.get<boolean>(`/${camionId}?date=${date}`);
  }

  // Ajouter un nouveau camion
  addCamion(camion: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, camion);
  }

  // livraison.service.ts
getCiterneDisponiblesPourDate(date: string): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8090/api/livraisons/citerne/disponibles?date=${date}`);
}


  // Mettre à jour un camion existant
  updateCamion(camion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${camion.id}`, camion);
  }

  // Supprimer un camion
  deleteCamion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
    // Récupérer les informations du camion par ID de livraison
    getCamionByLivraisonId(livraisonId: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/${livraisonId}`);

}
// Assurez-vous que cette méthode dans CamionService est correcte
getCiterneByImmatriculation(immatriculation: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/citernes/${immatriculation}`);
}



// Méthode dans le CamionService pour récupérer les camions par marque
// CamionService
getCamionsByMarque(marque: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/marques/${marque}`);
}
// Exemple de méthode dans CamionService pour récupérer les compartiments
getCompartimentsByCiterne(referenceCiterne: string): Observable<any[]> {
  return this.http.get<any[]>(`/api/camions/citerne/${referenceCiterne}/compartiments`);
}

// CamionService

getCiterneDetailsByReference(reference: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/citerne/details/${reference}`);
}



}
