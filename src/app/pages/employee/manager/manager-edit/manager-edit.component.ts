import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/dialog/dialog.service';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
  selector: 'app-manager-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-edit.component.html',
  styleUrls: ['./manager-edit.component.scss'],
})
export class ManagerEditComponent {
  editManagerId!: string; //params id
  companyId!: string; //params id
  editManagerForm: FormGroup;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private managerService: ManagerService,
    private route: ActivatedRoute
  ) {
    this.editManagerForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      phoneNumber: [''],
      address: [''],
    });

    this.companyId = this.route.snapshot.params['id'];
    this.editManagerId = this.route.snapshot.params['managerId'];
  }

  ngOnInit(): void {
    this.managerService.getManagerInfo(this.editManagerId).subscribe({
      next: (res) => {
        const managerData = res.data;
        console.log(res);
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

  //Cancel 버튼 클릭
  toBack(): void {
    this.router.navigate(['company/' + this.companyId + '/manager']);
  }

  //Edit 버튼 클릭
  onSubmit() {
    const managerData = {
      ...this.editManagerForm.value,
    };

    this.managerService.editManager(this.editManagerId, managerData).subscribe({
      next: () => {
        this.router.navigate(['company/' + this.companyId + '/manager']);
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
