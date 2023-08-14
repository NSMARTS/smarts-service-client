import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SidenavItemComponent } from './sidenav-item/sidenav-item.component';
import { RouterModule } from '@angular/router';
import { SidenavService } from 'src/app/stores/layout/sidenav.service';
import { SidenavViewPolicy } from 'src/app/interfaces/navigation-item.interface';
import { NavigationService } from 'src/app/stores/layout/navigiation.service';

@Component({
    selector: 'app-sidenav',
    standalone: true,
    imports: [
        CommonModule,
        SidenavItemComponent,
        RouterModule
    ],
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

    private sidenavService = inject(SidenavService);
    // 데스크탑 모드
    isDesktop = this.sidenavService.isDesktop;

    private navigationService = inject(NavigationService);
    // 사이드 내비 구성 데이터
    navItems = this.navigationService.navItems;



    // 나중에 타입을 알면 추가
    flag: SidenavViewPolicy = {
        isReplacementDay: false,
        isManager: false,
    };



}
