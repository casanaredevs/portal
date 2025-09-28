import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild
} from '@angular/core';
import { timer } from 'rxjs';
import { Developer } from '../../models/developer.model';

@Component({
  selector: 'app-developer-card',
  templateUrl: './developer-card.component.html',
  styleUrls: ['./developer-card.component.scss']
})
export class DeveloperCardComponent implements AfterViewInit {
  @Input() developer!: Developer;
  @ViewChild('divAvatar') divAvatar!: ElementRef<HTMLDivElement>;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.adjustAvatarSize();
  }

  private adjustAvatarSize(): void {
    if (!this.divAvatar) return;

    const element = this.divAvatar.nativeElement;
    const { clientWidth, clientHeight } = element;

    if (clientWidth !== clientHeight) {
      this.renderer.setStyle(element, 'height', clientWidth + 'px');

      timer(200).subscribe({
        next: () => this.adjustAvatarSize()
      });
    }
  }
}
