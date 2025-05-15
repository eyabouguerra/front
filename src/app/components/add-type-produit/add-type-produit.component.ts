import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TypeProduitService } from '../../services/type-produit.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-add-type-produit',
  templateUrl: './add-type-produit.component.html',
  styleUrls: ['./add-type-produit.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class AddTypeProduitComponent implements OnInit, AfterViewInit {
  selectedImageFile: File | null = null;
imagePreview: any = null;

  addProduitForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddTypeProduitComponent>,
    private TproduitService: TypeProduitService,
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private sanitizer:DomSanitizer
  ) {}

  ngOnInit(): void {
    // Initialiser la date avec la date système
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    this.addProduitForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      date: [{value: today, disabled: true}, [Validators.required]]
    });
    
    // Appliquer des effets visuels lors de l'ouverture
    setTimeout(() => {
      const container = this.elementRef.nativeElement.querySelector('.popup-container');
      if (container) {
        container.classList.add('show');
      }
    }, 100);
  }
  ngAfterViewInit(): void {
    // Ajouter un écouteur d'événements pour les effets d'ondulation sur les boutons
    this.setupRippleEffect();
  }
  
  setupRippleEffect(): void {
    const buttons = this.elementRef.nativeElement.querySelectorAll('.btn-save, .btn-cancel');
    
    buttons.forEach((button: HTMLElement) => {
      button.addEventListener('mousedown', (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const effect = button.querySelector('.btn-effect') as HTMLElement;
        if (effect) {
          effect.style.left = `${x}px`;
          effect.style.top = `${y}px`;
        }
      });
    });
  }

  onNoClick(): void {
    // Animation de sortie avant fermeture
    const container = this.elementRef.nativeElement.querySelector('.popup-container');
    if (container) {
      container.classList.add('hide');
      setTimeout(() => {
        this.dialogRef.close();
      }, 200);
    } else {
      this.dialogRef.close();
    }
  }
  addProduit(): void {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.addProduitForm.controls).forEach(field => {
      const control = this.addProduitForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
    
    if (this.addProduitForm.valid) {
      this.isSubmitting = true;
      
      // Récupérer toutes les valeurs, y compris les champs désactivés
      const formValues = {
        ...this.addProduitForm.getRawValue()
      };
  
      this.TproduitService.addTypeProduit(formValues).subscribe({
        next: () => {
          this.isSuccessful = true;
          this.isFailed = false;
          this.isSubmitting = false;
          
          // Animation de succès
          this.animateSuccess();
          
          // Close the dialog after a short delay to show success message
          setTimeout(() => {
            this.dialogRef.close(true); // Close the dialog with success
          }, 1500);
        },
        error: (error) => {
          this.isFailed = true;
          this.isSuccessful = false;
          this.isSubmitting = false;
          console.error('Error adding type produit:', error);
          
          this.animateError();
        }
      });
    } else {
      this.isFailed = true;
      this.animateError();
    }
  }
  
  animateSuccess(): void {
    // Animation de succès
    const container = this.elementRef.nativeElement.querySelector('.popup-container');
    if (container) {
      container.classList.add('success-anim');
    }
  }
  
  animateError(): void {
    // Animation d'erreur (secousse)
    const container = this.elementRef.nativeElement.querySelector('.popup-container');
    if (container) {
      container.classList.add('shake');
      setTimeout(() => {
        container.classList.remove('shake');
      }, 600);
    }
  }
  /*onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
  
      // Pour afficher l'aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }*/
  
 
}