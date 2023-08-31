import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SidenavItemComponent } from './sidenav-item/sidenav-item.component';
import { Router, RouterModule } from '@angular/router';
import { SidenavService } from 'src/app/stores/layout/sidenav.service';
import { NavigationService } from 'src/app/stores/layout/navigation.service';
import { SidenavViewPolicy } from 'src/app/interfaces/navigation-item.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    SidenavItemComponent,
    RouterModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SidenavComponent implements OnInit {

  private sidenavService = inject(SidenavService);
  // 데스크탑 모드
  isDesktop = this.sidenavService.isDesktop;

  private navigationService = inject(NavigationService);
  // 사이드 내비 구성 데이터
  navItems = this.navigationService.navItems;

  private authService = inject(AuthService);

  router = inject(Router);

  userInfo = this.authService.userInfoStore
  // 나중에 타입을 알면 추가
  sidenavItems: any = [];
  ngOnInit() {

    const splittedUrl = this.router.url.split('/');

    // company의 하위 url인 경우 sidebar update
    if (splittedUrl[1] === 'company' && splittedUrl.length > 2) {

      // companyId 저장
      const companyId = splittedUrl[2];
      const sidenavItems = structuredClone(this.navItems());

      for (let item of sidenavItems) {
        (item as any).children.map((element: any) => {
          element.route = `company/${companyId}` + element.route;
          return element;
        });
      }

      this.sidenavItems = sidenavItems;
      console.log(this.sidenavItems)
    }

  }


}
