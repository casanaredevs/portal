import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
  ],
  standalone: true
})
export class PageNotFoundComponent {

  currentURL: string

  constructor(router: Router) {
    this.currentURL = router.url
  }

}
