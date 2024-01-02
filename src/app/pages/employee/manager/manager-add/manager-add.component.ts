import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { Manager } from 'src/app/interfaces/manager.interface';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-manager-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-add.component.html',
  styleUrls: ['./manager-add.component.scss'],
})
export class ManagerAddComponent {
  addManagerForm: FormGroup;
  companyId: any;
  isSuperManager = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private managerService: ManagerService,
    private dialogService: DialogService
  ) {
    this.addManagerForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.pattern(/^[0-9-]*$/)]),
      address: new FormControl(''),
      isSuperManager: new FormControl(false),
    });

    this.companyId = this.route.snapshot.params['id'];
  }

  addManager() {
    if (this.addManagerForm.valid) {
      const postData = {
        ...this.addManagerForm.value,
        companyId: this.companyId,
      };

      this.managerService.addManager(postData).subscribe({
        next: (res) => {
          this.router.navigate(['company/' + this.companyId + '/manager']);
          this.dialogService.openDialogPositive(
            'Successfully, the manager has been add.'
          );
        },
        error: (err) => {
          console.error(err);
          if (err.status === 500) {
            this.dialogService.openDialogNegative(
              'Manager email is duplicated.'
            );
          } else {
            this.dialogService.openDialogNegative(
              'An error occurred while adding manager.'
            );
          }
        },
      });
    }
  }

  //input type="number" 한글 안써지도록
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (inputElement.classList.contains('numeric-input')) {
      const numericValue = inputValue.replace(/[^-\d]/g, '');
      inputElement.value = numericValue;
    }
  }

  toBack() {
    this.router.navigate(['company/' + this.companyId + '/manager']);
  }
}
