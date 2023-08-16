import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [
        CommonModule,
        MaterialsModule,
        RouterModule,
        ReactiveFormsModule
    ],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SignInComponent {
    private authService = inject(AuthService);

    signInForm: FormGroup = new FormGroup({
        email: new FormControl(''),
        password: new FormControl(''),
    });

    constructor(
        private fb: FormBuilder,
        private router: Router
    ) {
        // 유효성 검사
        this.signInForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    signIn() {
        console.log(this.signInForm.value)

        this.authService.signIn(this.signInForm.value).subscribe({
            next: (res) => {
                this.router.navigate([''])
            },
            error: (e) => console.log(e)
        });
    }
}
