import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ApproutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialsModule } from './materials/materials.module';
import { ToolbarComponent } from './components/layout/toolbar/toolbar.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        ApproutingModule,
        BrowserAnimationsModule,
        MaterialsModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
