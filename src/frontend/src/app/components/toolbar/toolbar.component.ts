import {
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Output() navigationSidenav = new EventEmitter<void>()

  constructor (public commonService: CommonService) { }

  ngOnInit (): void { }

}
