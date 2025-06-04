import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { SliderComponent } from './components/slider/slider.component';
import { DashReceptionnaireComponent } from './components/dash-receptionnaire/dash-receptionnaire.component';
import { Header2Component } from './components/header2/header2.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { LivraisonsComponent } from './components/livraisons/livraisons.component';
import { ReceptionnairePageComponent } from './components/receptionnaire-page/receptionnaire-page.component';
import { AddCommandeComponent } from './components/add-commande/add-commande.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AddLivraisonComponent } from './components/add-livraison/add-livraison.component';
import { FormsModule } from '@angular/forms';

import { AddProduitComponent } from './components/add-produit/add-produit.component';
import { EditProduitComponent } from './components/edit-produit/edit-produit.component';
import { EditCommandeComponent } from './components/edit-commande/edit-commande.component';
import { DialogLivraisonDetailsComponent } from './components/dialog-livraison-details/dialog-livraison-details.component';
import { EditLivraisonComponent } from './components/edit-livraison/edit-livraison.component';

import { AddTypeProduitComponent } from './components/add-type-produit/add-type-produit.component';
import { TypeProduitComponent } from './components/type-produit/type-produit.component';
import { EditTypeProduitComponent } from './components/edit-type-produit/edit-type-produit.component';
import { ProduitsParTypeComponent } from './components/produits-par-type/produits-par-type.component';
import { CategorieUserComponent } from './components/categorie-user/categorie-user.component';
import { CartComponent } from './components/cart/cart.component';

import { BuyProductComponent } from './components/buy-product/buy-product.component';
import { ProduitUserComponent } from './components/produit-user/produit-user.component';
import { CamionsComponent } from './components/camions/camions.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // Ajoute cette ligne
import { ToastrModule } from 'ngx-toastr'
import { MatTableModule } from '@angular/material/table';
import { CiternesComponent } from './components/citernes/citernes.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DashAdminComponent } from './components/dash-admin/dash-admin.component';
import { AdminPageComponent } from './components/admin-page/admin-page.component';
import { CreerDispatcheurComponent } from './components/creer-dispatcheur/creer-dispatcheur.component';
import { CollapsibleInscrireComponent } from './components/collapsible-inscrire/collapsible-inscrire.component';
import { SignupAdminComponent } from './components/signup-admin/signup-admin.component';
import { GestionAdminComponent } from './components/gestion-admin/gestion-admin.component';
import { GestionDispatcheurComponent } from './components/gestion-dispatcheur/gestion-dispatcheur.component';
import { CompartimentsComponent } from './components/compartiments/compartiments.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { ServiceHomeComponent } from './components/service-home/service-home.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { GestionClientComponent } from './components/gestion-client/gestion-client.component';
import { NgChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddClientComponent } from './components/add-client/add-client.component';
import { MapComponent } from './components/map/map.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { MesCommandesComponent } from './components/mes-commandes/mes-commandes.component';
import { SuivreLivraisonComponent } from './components/suivre-livraison/suivre-livraison.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    SliderComponent,
    DashReceptionnaireComponent,
    Header2Component,
    CommandesComponent,
    LivraisonsComponent,
    ReceptionnairePageComponent,
    AddCommandeComponent,
    AddLivraisonComponent,
    AddProduitComponent,
    EditProduitComponent,
    EditCommandeComponent,
    DialogLivraisonDetailsComponent,
    EditLivraisonComponent,
    TypeProduitComponent,
    EditTypeProduitComponent,
    AddTypeProduitComponent,
    ProduitsParTypeComponent,
    CategorieUserComponent,
    CartComponent,
    BuyProductComponent,
    ProduitUserComponent,
    CamionsComponent,
    CiternesComponent,
    DashAdminComponent,
    AdminPageComponent,
    CreerDispatcheurComponent,
    CollapsibleInscrireComponent,
    SignupAdminComponent,
    GestionAdminComponent,
    GestionDispatcheurComponent,
    CompartimentsComponent,
    OrderConfirmationComponent,
    ServiceHomeComponent,
    LoginComponent,
    RegisterComponent,
    GestionClientComponent,
    AddClientComponent,
    MapComponent,
    TrackingComponent,
    ServicesComponent,
    AboutComponent,
    MesCommandesComponent,
    SuivreLivraisonComponent,

  
  
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FullCalendarModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    NgChartsModule,
    MatTableModule,
    MatSnackBarModule,
    
  ToastrModule.forRoot(),
  NgxPaginationModule
   

   
    
    

    
    
    
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
