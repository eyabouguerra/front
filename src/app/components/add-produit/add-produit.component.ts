import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProduitService } from 'src/app/services/produit.service';
import { debounceTime, switchMap, map, catchError, of, first } from 'rxjs';

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {

  produitForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private dialogRef: MatDialogRef<AddProduitComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { typeId: number }
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.produitForm = this.fb.group({
      codeProduit: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ], [this.codeProduitUniqueValidator()]],

      nomProduit: ['', [Validators.required, Validators.maxLength(100)]],
      libelle: ['', Validators.maxLength(200)],
      prix: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      date: [{ value: today, disabled: true }],
      description: ['', Validators.maxLength(1000)],
      typeProduit: { id: this.data.typeId }
    });
  }

  codeProduitUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return control.valueChanges.pipe(
        debounceTime(400),
        switchMap(code => this.produitService.checkCodeProduitExists(code)),
        map(exists => exists ? { codeProduitExists: true } : null),
        catchError(() => of(null)),
        first()
      );
    };
  }

  saveProduit(): void {
    if (this.produitForm.valid) {
      this.loading = true;
      const produitData = {
        ...this.produitForm.getRawValue(),
        typeProduit: { id: this.data.typeId }
      };

      this.produitService.addProduit(produitData).subscribe({
        next: () => {
          this.snackBar.open('✅ Produit ajouté avec succès !', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du produit:', err);
          this.snackBar.open('❌ Une erreur est survenue.', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.validateAllFormFields();
    }
  }

  validateAllFormFields(): void {
    Object.keys(this.produitForm.controls).forEach(field => {
      const control = this.produitForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
  genererCodeProduit(): void {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = 'PR-';
    for (let i = 0; i < 10; i++) {
      code += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  
    this.produitForm.get('codeProduit')?.setValue(code);
    this.produitForm.get('codeProduit')?.markAsTouched();
  }
  

  cancelAdd(): void {
    this.dialogRef.close(false);
  }
}
