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
    // private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private managerService: ManagerService
  ) {
    // this.companyName = this.route.snapshot.params['companyName'];
    this.addManagerForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      phoneNumber: new FormControl(''),
      address: new FormControl(''),
    });

    this.companyId = this.route.snapshot.params['id'];

    this.managerService.getManagerList().subscribe({
      next: (res) => {
        console.log(res.data);

        this.nationList = res.data;
      },
      error: (err) => console.error(err),
    });
  }

  ngOnInit(): void {
    console.log(this.companyId);
  }

  onSubmit() {
    const postData = {
      ...this.addManagerForm.value,
      companyId: this.companyId,
    };

    console.log(postData);
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
}
