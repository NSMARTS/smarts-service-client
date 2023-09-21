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
export class CountryAddComponent {
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

  onSubmit() {
    if (this.hasErrors()) {
      //유효성 검사 실패 시 빨갛게 나옴
    } else {
      // 유효성 검사 통과 시
      this.addCountry();
    }
  }

  addCountry() {
    const countryData = {
      countryName: this.countryForm.value.countryName,
      countryCode: this.countryForm.value.countryCode,
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

  // 유효성 검사 함수
  private hasErrors() {
    const countryNameError = this.countryForm
      .get('countryName')
      ?.hasError('required');
    const countryCodeError = this.countryForm
      .get('countryCode')
      ?.hasError('required');

    return countryNameError || countryCodeError;
  }
}
