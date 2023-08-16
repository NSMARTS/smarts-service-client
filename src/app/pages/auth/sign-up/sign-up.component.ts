import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

//폼 데이터 타입 정의
interface FormData {
    email: FormControl;
    password: FormControl;
    confirmedPassword: FormControl;
    name: FormControl;
}

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [
        CommonModule,
        MaterialsModule,
        RouterModule,
        ReactiveFormsModule
    ],
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SignUpComponent {
    private authService = inject(AuthService);

    signUpForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),
        confirmedPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),
        username: new FormControl('', [Validators.required]),
    })
    constructor(
        private fb: FormBuilder,
        private router: Router
    ) { }
    signUp() {
        console.log(this.signUpForm.value)
        this.authService.signUp(this.signUpForm.value).subscribe({
            next: (res) => {
                this.router.navigate(['/signin'])
            },
            error: (e) => console.error(e)
        });
    }
}
