import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-client-info-dialog',
  templateUrl: './client-info-dialog.component.html',
  styleUrls: ['./client-info-dialog.component.css']
})
export class ClientInfoDialogComponent {
  // Define showOrderModal here
  showOrderModal = true;  // You can adjust the default value based on your needs

  data = {
    fullName: '',
    fullAddress: '',
    contactNumber: '',
    alternateContactNumber: '',
    orderProductQuantityList: [] as { id: number; quantity: number }[]
  };

  constructor(
    public dialogRef: MatDialogRef<ClientInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public injectedData: any
  ) {
    this.data.orderProductQuantityList = injectedData.orderProductQuantityList;
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.dialogRef.close(this.data);
    }
  }

  closeOrderModal(): void {
    this.dialogRef.close();
  }
}
