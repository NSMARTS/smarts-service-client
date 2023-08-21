import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { MaterialsModule } from '../materials/materials.module';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './dialog.component.html', 
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {
  flag: boolean | undefined;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
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

// positive
@Component({
  selector: 'app-positive-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './positive-dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class PositiveDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PositiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  closeModal() {
    this.dialogRef.close();
  }
}

//negative
@Component({
  selector: 'app-negative-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './negative-dialog-component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class NegativeDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<NegativeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  closeModal() {
    this.dialogRef.close();
  }
}
