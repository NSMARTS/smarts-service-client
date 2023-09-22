import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavItemComponent } from '../sidenav-item/sidenav-item.component';
import { Router, RouterModule } from '@angular/router';
import { SidenavService } from 'src/app/stores/layout/sidenav.service';
import { NavigationService } from 'src/app/stores/layout/navigation.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, SidenavItemComponent, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
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

  userInfo = this.authService.userInfoStore;

  // 나중에 타입을 알면 추가
  sidenavItems: any = [];

  ngOnInit() {}
}
