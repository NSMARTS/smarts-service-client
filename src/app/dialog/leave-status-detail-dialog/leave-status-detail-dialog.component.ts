import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';

@Component({
  selector: 'app-leave-status-detail-dialog',
  templateUrl: './leave-status-detail-dialog.component.html',
  styleUrls: ['./leave-status-detail-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class LeaveStatusDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LeaveStatusDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {

  }

  cancelRequest() {
    this.dialogRef.close('success')
  }
}
