import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CustomDateFormat1, CustomDateFormat2 } from './custom-date-format.directive';

@NgModule({
	declarations: [
		CustomDateFormat1,
		CustomDateFormat2,
	],
	exports: [
		CustomDateFormat1,
    CustomDateFormat2
	],
	providers: [],
})
export class CustomDateDirectiveModule { }
