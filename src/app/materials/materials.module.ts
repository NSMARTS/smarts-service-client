import { NgModule } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';

// Angular flex layout npm i -s @angular/flex-layout 설치해야함
import { FlexLayoutModule } from '@angular/flex-layout';

// Form Module

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatToolbarModule } from '@angular/material/toolbar';

import { MatBadgeModule } from '@angular/material/badge';

import { MatCardModule } from '@angular/material/card';

import { MatDialogModule } from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  exports: [
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatRippleModule,
    MatMenuModule,
    MatTooltipModule, // 툴팁 모듈
    MatBadgeModule, // 알림 몇개 왔는지 숫자 표식용 모듈
    MatDialogModule,
    MatCardModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
  ],
})
export class MaterialsModule {}
