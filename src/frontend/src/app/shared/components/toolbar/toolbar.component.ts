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

  constructor(public commonService: CommonService) {}

}
