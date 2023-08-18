import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ApproutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialsModule } from './materials/materials.module';
import { httpInterceptorProviders } from './interceptors/http-interceptor';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ApproutingModule,
    BrowserAnimationsModule,
    MaterialsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  providers: [
    // 모든 http 요청에 withCredential:true 오션을 주기위해 사용
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
