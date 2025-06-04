import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CiterneService {
  private baseUrl = 'http://localhost:8090/api/citernes';
  private compartimentsUrl = 'http://localhost:8090/api/compartiments';  // Correct URL for compartiments

  constructor(private http: HttpClient) {}

  // Fetch citernes
  getCiternes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Fetch compartiments
  getCompartiments(): Observable<any[]> {
    return this.http.get<any[]>(this.compartimentsUrl);  // Ensure this URL is correct
  }
  getCiterneByImmatriculationEtDate(immatriculation: string, date: string) {
    return this.http.get(`${this.baseUrl}/citernes/immatriculation/${immatriculation}?date=${date}`);
  }
  
  getCiternesDisponibles(date: string) {
    return this.http.get(`${this.baseUrl}/citernes/disponibles?date=${date}`);
  }
  // Add citerne
  addCiterne(citerne: any): Observable<any> {
    return this.http.post(this.baseUrl, citerne);
  }

  // Add compartiment to citerne
  addCompartimentToCiterne(citerneId: number, compartiment: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${citerneId}/compartiment`, compartiment);
  }

  // Get a specific citerne by ID
  getCiterne(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Update citerne
  updateCiterne(citerne: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${citerne.id}`, citerne);
  }
  
  
  // Delete citerne
  deleteCiterne(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}