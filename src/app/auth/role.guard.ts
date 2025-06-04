import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'];
    const userRoles: string[] = JSON.parse(localStorage.getItem('roles') || '[]');

    const hasRole = expectedRoles.some((role: string) => userRoles.includes(role));

    if (!hasRole) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
