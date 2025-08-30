import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonService } from '@shared/services/common.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Output() navigationSidenav = new EventEmitter<void>()

  showMobileMenu = false;

  constructor(public commonService: CommonService) {}

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

}
