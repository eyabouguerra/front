import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompartimentService {

  private apiUrl = 'http://localhost:8090/api/compartiments';

  constructor(private http: HttpClient) { }

  // Récupérer la liste des citernes
  getCiternes(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8090/api/citernes`);
  }

  // Récupérer la liste des compartiments
  getCompartiments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  // compartiment.service.ts
  getCompartimentsByCiterneId(citerneId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/citerne/${citerneId}/compartiments`);
  }
  

  // Ajouter un compartiment indépendamment
  addCompartiment(compartiment: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, compartiment);
  }

  // Ajouter un compartiment à une citerne
  addCompartimentToCiterne(citerneId: number, compartiment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/citerne/${citerneId}/add`, compartiment);
  }

  // Récupérer un compartiment par son ID
  getCompartiment(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les compartiments par l'ID de la citerne
 /* getCompartimentsByCiterneId(citerneId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-id/${citerneId}`);
  }*/

  // Récupérer les compartiments par la référence de la citerne
  getCompartimentsByCiterneReference(reference: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-reference/${reference}`);
  }

  // Mettre à jour un compartiment
  updateCompartiment(compartiment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${compartiment.id}`, compartiment);
  }

  // Supprimer un compartiment
  deleteCompartiment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}