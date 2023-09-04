import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-positive-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './positive-dialog.component.html',
  styleUrls: ['./positive-dialog.component.scss'],
})
export class PositiveDialogComponent {
  flag: boolean | undefined;

  constructor(
    public dialogRef: MatDialogRef<PositiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.data.flag = true;
  }

  closeModal() {
    this.data.flag = false;
    this.dialogRef.close();
  }
}
