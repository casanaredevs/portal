import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Input() title: string = 'Grupo de desarrolladores de Casanare';
  @Input() description: string = 'Este grupo fue creado con fines comunitarios, apoyarnos, aprender de tecnologías y novedades del ecosistema de transformación digital.';

  constructor() { }
}
