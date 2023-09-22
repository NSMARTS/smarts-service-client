import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './country-edit.component.html',
  styleUrls: ['./country-edit.component.scss'],
})
export class CountryEditComponent implements OnInit {
  // view table
  displayedColumns: string[] = ['countryName', 'countryCode'];
  // form group
  countryForm!: FormGroup<any>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CountryEditComponent>,
    private dialogService: DialogService,
    private countryService: CountryService,
    // countryId
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.getCountry();
    this.countryForm = this.fb.group({
      countryName: ['', [Validators.required]],
      countryCode: ['', [Validators.required]],
    });
  }

  getCountry() {
    this.countryService.getCountryInfo(this.data).subscribe({
      next: (res: any) => {
        this.countryForm.patchValue(res.getCountryById);
      },
      error: (err: any) => {
        console.log(err.error.message);
      },
    });
  }

  editCountry() {
    if (this.countryForm.valid) {
      const formValue = this.countryForm.value;
      const countryData = {
        _id: this.data.countryId,
        countryName: formValue.countryName,
        countryCode: formValue.countryCode,
      };
      console.log(countryData);
      this.countryService.editCountry(countryData).subscribe({
        next: (data: any) => {
          this.dialogRef.close();
          this.dialogService.openDialogPositive('Success edit country.');
        },
        error: (e) => {
          if (e.error.message == 'The country code is duplicated.') {
            this.dialogRef.close();
            this.dialogService.openDialogNegative(
              'The country code is duplicated.'
            );
          } else if (e.error.message == 'editing Country Error') {
            this.dialogRef.close();
            this.dialogService.openDialogNegative('An error has occured.');
          }
        },
      });
    }
  }
}
