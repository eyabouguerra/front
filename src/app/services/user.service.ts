import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAuthService } from './user-auth.service';
import { Observable } from 'rxjs'; 
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly PATH_OF_API = "http://localhost:8090";

  constructor(
    private httpclient: HttpClient,
    private userAuthService: UserAuthService
  ) {}

  // Méthode pour récupérer les en-têtes avec ou sans Auth
  private getHeaders(withAuth: boolean): HttpHeaders {
    let headers = new HttpHeaders();
    if (withAuth) {
      const token = this.userAuthService.getToken(); // Récupérer le token JWT
      if (token) {
        headers = headers.set("Authorization", `Bearer ${token}`); // Ajouter l'en-tête Authorization
      }
    } else {
      headers = headers.set("No-Auth", "True"); // Ajouter un en-tête No-Auth pour les requêtes publiques
    }
    return headers;
  }

  // ✅ Inscription
  public register(registerData: any) {
    return this.httpclient.post(`${this.PATH_OF_API}/register`, registerData, {
      headers: this.getHeaders(false) // Pas besoin de token pour l'inscription
    });
  }
  
  // ✅ Connexion
  public login(loginData: any) {
    return this.httpclient.post(`${this.PATH_OF_API}/authenticate`, loginData, {
      headers: this.getHeaders(false) // Pas besoin de token pour la connexion
    });
  }

  // ✅ Récupération des rôles
  public getAllRoles() {
    return this.httpclient.get<string[]>(`${this.PATH_OF_API}/roles`, {
      headers: this.getHeaders(false) // Authentification nécessaire pour récupérer les rôles
    });
  }
  public getUsersByRole(roleName: string): Observable<any[]> {
    return this.httpclient.get<any[]>(`${this.PATH_OF_API}/users/byRole/${roleName}`, {
     
    });
  }
  
  // ✅ Vérification des rôles
  public roleMatch(allowedRoles: string[]): boolean {
    const userRoles = this.userAuthService.getRoles(); // string[]
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    return userRoles.some(role => allowedRoles.includes(role));
  }
  deleteUser(userName: string): Observable<any> {
    return this.httpclient.delete(`${this.PATH_OF_API}/${userName}`, {
      headers: this.getHeaders(true)  // Auth requise pour supprimer
    });
  }
 
  
  
}
