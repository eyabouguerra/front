import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClientService } from 'src/app/services/client.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css']
})
export class AddClientComponent implements OnInit {
  addClientForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<AddClientComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.addClientForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      fullAddress: ['', [Validators.required, Validators.maxLength(200)]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
    });
  }

  addClient(): void {
    if (this.addClientForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.isLoading = true;
    const clientData = this.addClientForm.value;

    this.clientService.createClient(clientData).subscribe({
      next: (newClient) => {
        this.isLoading = false;
        this.dialogRef.close(newClient); // Return the new client
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l\'ajout du client.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}