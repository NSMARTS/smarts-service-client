import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './country-add.component.html',
  styleUrls: ['./country-add.component.scss'],
})
export class CountryAddComponent implements OnInit {
  // view table
  displayedColumns: string[] = ['countryName', 'countryCode'];
  // form group
  countryForm: FormGroup<any>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CountryAddComponent>,
    private dialogService: DialogService,
    private countryService: CountryService
  ) {
    this.countryForm = this.fb.group({
      countryName: ['', [Validators.required]],
      countryCode: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  addCountry() {
    const formValue = this.countryForm.value;

    const countryData = {
      countryName: formValue.countryName,
      countryCode: formValue.countryCode,
    };

    this.countryService.addCountry(countryData).subscribe({
      next: (data: any) => {
        if (data.message == 'Success add country') {
          this.dialogRef.close();
          this.dialogService.openDialogPositive('Success add country.');
        }
      },
      error: (e) => {
        if (e.error.message == 'The country code is duplicated.') {
          this.dialogRef.close();
          this.dialogService.openDialogNegative(
            'The country code is duplicated.'
          );
        } else if (e.error.message == 'adding Country Error') {
          this.dialogRef.close();
          this.dialogService.openDialogNegative('An error has occured.');
        }
      },
    });
  }
}
