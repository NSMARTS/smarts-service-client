import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-negative-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './negative-dialog.component.html',
  styleUrls: ['./negative-dialog.component.scss'],
})
export class NegativeDialogComponent {
  flag: boolean | undefined;

  constructor(
    public dialogRef: MatDialogRef<NegativeDialogComponent>,
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
