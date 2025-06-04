import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { LivraisonsComponent } from './components/livraisons/livraisons.component';
import { ReceptionnairePageComponent } from './components/receptionnaire-page/receptionnaire-page.component';
import { AddCommandeComponent } from './components/add-commande/add-commande.component';

import { EditProduitComponent } from './components/edit-produit/edit-produit.component';
import { EditCommandeComponent } from './components/edit-commande/edit-commande.component';
import { AddLivraisonComponent } from './components/add-livraison/add-livraison.component';
import { EditLivraisonComponent } from './components/edit-livraison/edit-livraison.component';
import { TypeProduitComponent } from './components/type-produit/type-produit.component';
import { EditTypeProduitComponent } from './components/edit-type-produit/edit-type-produit.component';

import { ProduitsParTypeComponent } from './components/produits-par-type/produits-par-type.component';
import { AddProduitComponent } from './components/add-produit/add-produit.component';
import { CategorieUserComponent } from './components/categorie-user/categorie-user.component';
import { CartComponent } from './components/cart/cart.component';
import { BuyProductComponent } from './components/buy-product/buy-product.component';

import { BuyProductResolverService } from './services/buy-product-resolver.service';
import { ProduitUserComponent } from './components/produit-user/produit-user.component';
import { CamionsComponent } from './components/camions/camions.component';
import { CiternesComponent } from './components/citernes/citernes.component';
import { AdminPageComponent } from './components/admin-page/admin-page.component';
import { CreerDispatcheurComponent } from './components/creer-dispatcheur/creer-dispatcheur.component';
import { SignupAdminComponent } from './components/signup-admin/signup-admin.component';
import { RoleGuard } from './auth/role.guard';
 
import { GestionDispatcheurComponent } from './components/gestion-dispatcheur/gestion-dispatcheur.component';
import { GestionAdminComponent } from './components/gestion-admin/gestion-admin.component';
import { CompartimentsComponent } from './components/compartiments/compartiments.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { ServiceHomeComponent } from './components/service-home/service-home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GestionClientComponent } from './components/gestion-client/gestion-client.component';
import { UserRole } from './model/user-role'; 
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { MesCommandesComponent } from './components/mes-commandes/mes-commandes.component';
import { SuivreLivraisonComponent } from './components/suivre-livraison/suivre-livraison.component';
 
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'servicehome', component: ServiceHomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  
  //////////Dispatcheur////////////////
  { path: 'receptionnairepage', component: ReceptionnairePageComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'commandes', component: CommandesComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'produits/:id', component: ProduitsParTypeComponent ,canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'livraisons', component: LivraisonsComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'camions', component: CamionsComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'addcommande', component: AddCommandeComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'addlivraison', component: AddLivraisonComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'editcommande/:id', component: EditCommandeComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'editproduit/:id', component: EditProduitComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'edit-livraison/:id', component: EditLivraisonComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'type_produit', component: TypeProduitComponent ,canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'edit_type_produit/:id', component: EditTypeProduitComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'addProduit/:typeId', component: AddProduitComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'citernes', component: CiternesComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
  { path: 'compartiments/:idCiterne', component: CompartimentsComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_DISPATCHEUR] }},
 
  //////////////////admin////////////
  { 
    path: 'adminpage',
    component: AdminPageComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_ADMIN] }
  },
  { 
    path: 'creerdispatcheur',
    component: CreerDispatcheurComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_ADMIN] }
  },
  { 
    path: 'signupadmin',
    component: SignupAdminComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_ADMIN] }
  },
  { 
    path: 'gestiondispatcheur',
    component: GestionDispatcheurComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_ADMIN] }
  },
  { 
    path: 'gestionadmin',
    component: GestionAdminComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_ADMIN] }
  },
  { 
    path: 'gestionclient',
    component: GestionClientComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_ADMIN] }
  },


  /////////////client//////////
  { path: 'categories', component: CategorieUserComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_USER] } },
  { path: 'produits_user/:typeId', component: ProduitUserComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_USER] }},
  { path: 'cart', component: CartComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_USER] }},
  {
    path: 'buyProduct/:id',
    component: BuyProductComponent,
    resolve: {
      productDetails: BuyProductResolverService
    },
     canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_USER] }
  },
  {
    path: 'orderConfirm',
    component: OrderConfirmationComponent,
    canActivate: [RoleGuard],
    data: { expectedRoles: [UserRole.ROLE_USER] }
  },
  { path: 'mes-commandes', component: MesCommandesComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_USER] } },
  { path: 'suivre_livraison', component: SuivreLivraisonComponent , canActivate: [RoleGuard],data: { expectedRoles: [UserRole.ROLE_USER] } },
  
  


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
