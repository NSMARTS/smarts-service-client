import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'smarts-service';

  constructor(
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIconResolver(
      (name: string, namespace: string): any => {
        switch (namespace) {
          case 'matTwoTone':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/icons/material-design-icons/two-tone/${name}.svg`
            );
          case 'matFilled':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/icons/material-design-icons/filled/${name}.svg`
            );
          case 'matOutlined':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/icons/material-design-icons/outlined/${name}.svg`
            );
        }
      }
    );
  }
}
