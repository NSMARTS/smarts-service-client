import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ManagerService } from 'src/app/services/manager.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-manager-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-edit.component.html',
  styleUrls: ['./manager-edit.component.scss'],
})
export class ManagerEditComponent {
  managerId!: string; //params id
  companyId!: string; //params id
  editManagerForm: FormGroup;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private managerService: ManagerService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.editManagerForm = this.formBuilder.group({
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      username: ['', [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^[0-9-]*$/)]],
      address: [''],
      isSuperManager: [''],
    });

    this.companyId = this.route.snapshot.params['id'];
    this.managerId = this.route.snapshot.params['managerId'];
  }

  ngOnInit(): void {
    this.managerService.getManagerInfo(this.managerId).subscribe({
      next: (res) => {
        const managerData = res.data;
        this.editManagerForm.patchValue(managerData);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('Manager not found');
        } else {
          console.error('An error occurred while fetching manager info');
        }
      },
    });
  }

  //Edit Manager 버튼 클릭
  editManager() {
    if (this.editManagerForm.valid) {
      const managerData = {
        ...this.editManagerForm.value,
      };
      this.managerService.editManager(this.managerId, managerData).subscribe({
        next: () => {
          this.router.navigate(['company/' + this.companyId + '/manager']);
          this.dialogService.openDialogPositive(
            'Successfully, the manager has been edit.'
          );
        },
        error: (err) => {
          console.error(err);
          if (err.status === 404) {
            this.dialogService.openDialogNegative('Manager not found');
          } else {
            this.dialogService.openDialogNegative(
              'An error occurred while updating manager'
            );
          }
        },
      });
    }
  }

  resetManagerPassword() {
    this.dialogService
      .openDialogConfirm('Do you reset this manager password?')
      .subscribe((result: any) => {
        if (result) {
          this.managerService.resetManagerPassword(this.managerId).subscribe({
            next: () => {
              this.dialogService.openDialogPositive(
                'Successfully, the manager password has been reset "qwer1234".'
              );
              this.router.navigate(['company/' + this.companyId + '/manager']);
            },
            error: (err: any) => {
              console.error(err);
              this.dialogService.openDialogNegative('Loadings Docs Error');
            },
          });
        }
      });
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
