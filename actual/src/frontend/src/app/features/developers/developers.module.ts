import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DeveloperCardComponent } from './components/developer-card/developer-card.component';
import { DevelopersGridComponent } from './components/developers-grid/developers-grid.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';

@NgModule({
  declarations: [
    DeveloperCardComponent,
    DevelopersGridComponent,
    HeroSectionComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [
    DeveloperCardComponent,
    DevelopersGridComponent,
    HeroSectionComponent
  ]
})
export class DevelopersModule { }
