import { Injectable } from '@angular/core';
import { ProduitService } from './produit.service';  // Vérifie que ce fichier existe bien !
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'; 
import { map, Observable } from 'rxjs';
import { Product } from 'src/app/model/product.model';  // Vérifie bien le chemin !

@Injectable({
  providedIn: 'root'         
})
export class BuyProductResolverService implements Resolve<Product[]> {

  constructor(private productService: ProduitService) { }

  resolve(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Product[] | Observable<Product[]> | Promise<Product[]> {
    const id: number = Number(route.paramMap.get("id"));
    const isSingleProductCheckout: boolean = route.paramMap.get("isSingleProductCheckout") === "true";
  
    return this.productService.getProductDetails(isSingleProductCheckout, id)
  }
  
}
 