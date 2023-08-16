import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-find-pw',
    standalone: true,
    imports: [
        CommonModule,
        MaterialsModule,
        RouterModule,
        ReactiveFormsModule
    ],
    templateUrl: './find-pw.component.html',
    styleUrls: ['./find-pw.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class FindPwComponent {

}
