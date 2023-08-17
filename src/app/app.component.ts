import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'smarts-service';

  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    this.authService.persistLogin();
  }
}
