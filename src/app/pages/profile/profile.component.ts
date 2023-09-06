import { AuthService } from './../../services/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { DialogService } from 'src/app/dialog/dialog.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CountryService } from 'src/app/services/country.service';
import { Country } from 'src/app/interfaces/employee.interface';
import { tap } from 'rxjs';

export const comparePasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');


  return password && confirmPassword && password.value !== confirmPassword.value ? { isNotMatched: true } : null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  authService = inject(AuthService)
  userInfoStore = this.authService.userInfoStore
  editProfileForm: FormGroup;
  dialogService = inject(DialogService)
  countryService = inject(CountryService)
  profileService = inject(ProfileService)
  countryList: Country[] = [];

  constructor(
    private fb: FormBuilder,
  ) {
    this.editProfileForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      // empStartDate: new FormControl('', [Validators.required]),
      // empEndDate: new FormControl(''),
      // department: new FormControl(''),
      phoneNumber: new FormControl(''),
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
      profileImgPath: new FormControl(''),
    }, { validators: comparePasswordValidator });
  }

  ngOnInit() {
    this.editProfileForm.patchValue(this.userInfoStore());
  }

  /**
   * 매니저, 유저일 경우 사용
   */
  // getCountryList() {
  //   this.countryService.getCountryList().subscribe({
  //     next: (res: any) => {
  //       this.countryList = res.data;
  //       console.log(this.countryList)
  //     },
  //     error: (err) => console.error(err),
  //     complete: () => {
  //       this.editProfileForm.patchValue(this.userInfoStore());
  //       console.log(this.editProfileForm.value)
  //     }
  //   });
  // }


  /**
     * profile 사진 변경
     * @param fileInput image file
     */
  fileChangeEvent(event: any) {
    console.log('fileChangeEvent');
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.toLowerCase().endsWith('.jpg')
        || event.target.files[0].name.toLowerCase().endsWith('.png')) {
        // Image resize and update
        this.changeProfileImage(event.target.files[0]);
      } else {
        this.dialogService.openDialogNegative('Profile photos are only available for PNG and JPG.');
        // alert('프로필 사진은 PNG와 JPG만 가능합니다.');
      }
    } else {
      this.dialogService.openDialogNegative('Can not bring up pictures.');
      // alert('사진을 불러올 수 없습니다.');
    }
  }

  changeProfileImage(imgFile: File) {
    this.profileService.changeProfileImg(imgFile, this.userInfoStore()._id).subscribe({
      next: (res) => {
        this.userInfoStore.update((prev) => {
          return { ...prev, profileImgPath: res.data }
        })
      },
      error: (error) => { console.log(error) }
    })

  }

  updateProfile() {
    const patchData = {
      ...this.editProfileForm.value,
      _id: this.userInfoStore()._id
    }

    // updateForm 중 값이 ''이면 객체에서 삭제. patch 시 변경될 값만 설정
    for (const key in patchData) {
      if (patchData.hasOwnProperty(key) && patchData[key] === "") {
        delete patchData[key];
      }
    }

    this.profileService.updateProfile(patchData).subscribe({
      next: (res) => {
        if (res) this.refreshProfie()
      },
      error: (error) => { console.log(error) },
    })
  }

  refreshProfie() {
    this.authService.refreshToken().subscribe({
      next: async (data) => await this.authService.setAccessToken(data),
      error: (error) => console.log(error)
    })
  }

  getErrorMessage() {
    if (this.editProfileForm?.controls['password'].errors?.['required'] || this.editProfileForm?.controls['confirmPassword'].errors?.['required']) {
      return 'You must enter a value';
    }
    return this.editProfileForm?.errors?.['isNotMatched'] ? 'Passwords do not match.' : '';
  }




}
