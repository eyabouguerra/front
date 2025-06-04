import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdresseService {

  constructor(private http: HttpClient) {}

  validateAddress(address: string): Observable<any> {
    const url = `http://localhost:8090/api/geocode?address=${encodeURIComponent(address)}`;
    return this.http.get(url).pipe(
      map((result: any) => {
        console.log('Réponse backend geocode :', result); // Log pour déboguer
        if (result && result.latitude && result.longitude) {
          return {
            latitude: parseFloat(result.latitude),
            longitude: parseFloat(result.longitude)
          };
        } else {
          console.error('Aucun résultat pour l’adresse :', address);
          return null;
        }
      })
    );
  }}
