import { Component, Input, OnInit } from '@angular/core';
import { Developer } from '../../models/developer.model';

@Component({
  selector: 'app-developers-grid',
  templateUrl: './developers-grid.component.html',
  styleUrls: ['./developers-grid.component.scss']
})
export class DevelopersGridComponent implements OnInit {
  @Input() developers: Developer[] = [];

  constructor() { }

  ngOnInit(): void {
  }
}
