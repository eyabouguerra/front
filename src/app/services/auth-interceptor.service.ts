import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAuthService } from '../services/user-auth.service'; // adapte le chemin si nécessaire

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private userAuthService: UserAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si l'en-tête No-Auth est présent, ne pas ajouter le token
    if (req.headers.get('No-Auth') === 'True') {
      return next.handle(req);
    }

    // Récupération du token depuis le service d'authentification
    const token = this.userAuthService.getToken();

    // Si un token existe, cloner la requête et ajouter l'en-tête Authorization
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // Si pas de token, envoyer la requête telle quelle
    return next.handle(req);
  }
}
