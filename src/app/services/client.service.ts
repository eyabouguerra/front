import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8090/api/clients'; // Adjust to your backend URL

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getClientById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createClient(client: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, client);
  }

  // Add this method
getClientsByIds(ids: number[]): Observable<any[]> {
  const params = { ids: ids.join(',') };
  return this.http.get<any[]>(`${this.apiUrl}/clients`, { params });
}

}