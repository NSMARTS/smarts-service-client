import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';

@Component({
    selector: 'app-index',
    standalone: true,
    imports: [CommonModule, RouterModule, MaterialsModule],
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent {
    public isNavbarOnTop: boolean = true;

    @HostListener('window:scroll', ['$event'])
    onScroll(ev: Event) {
        if (window.scrollY === 0) {
            this.isNavbarOnTop = true;
        } else {
            this.isNavbarOnTop = false;
        }
    }
}
