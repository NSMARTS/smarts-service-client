import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ManagerService } from 'src/app/services/manager.service';
import { Manager } from 'src/app/interfaces/manager.interface';

@Component({
  selector: 'app-manager-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './manager-add.component.html',
  styleUrls: ['./manager-add.component.scss'],
})
export class ManagerAddComponent {
  addManagerForm: FormGroup;
  nationList: Manager[] = [];
  companyId: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private managerService: ManagerService
  ) {
    this.addManagerForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      phoneNumber: new FormControl('', [Validators.pattern(/^[0-9]*$/)]),
      address: new FormControl(''),
    });

    this.companyId = this.route.snapshot.params['id'];

    this.managerService.getManagerList(this.companyId).subscribe({
      next: (res) => {
        this.nationList = res.data;
      },
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    const postData = {
      ...this.addManagerForm.value,
      companyId: this.companyId,
    };

    this.managerService.addManager(postData).subscribe({
      next: (res) => {
        this.router.navigate(['company/' + this.companyId + '/manager']);
      },
      error: (e) => console.error(e),
    });
  }

  toBack() {
    this.router.navigate(['company/' + this.companyId + '/manager']);
  }

  //유효성 검사
  isButtonDisabled(): any {
    const emailRequiredError = this.addManagerForm
      .get('email')
      ?.hasError('required');
    const emailEmailError = this.addManagerForm.get('email')?.hasError('email');
    const usernameError = this.addManagerForm
      .get('username')
      ?.hasError('required');
    const passwordRequiredError = this.addManagerForm
      .get('password')
      ?.hasError('required');
    const passwordMinLengthError = this.addManagerForm
      .get('password')
      ?.hasError('minlength');
    const phoneNumberError = this.addManagerForm
      .get('phoneNumber')
      ?.hasError('pattern');

    return (
      emailRequiredError ||
      emailEmailError ||
      usernameError ||
      passwordRequiredError ||
      passwordMinLengthError ||
      phoneNumberError
    );
  }
}
