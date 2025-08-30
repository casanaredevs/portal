import { Component, OnInit } from '@angular/core';
import { DeveloperService } from '../../features/developers/services/developer.service';
import { Developer } from '../../features/developers/models/developer.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  developers: Developer[] = [];

  constructor(private developerService: DeveloperService) { }

  ngOnInit(): void {
    this.loadDevelopers();
  }

  private loadDevelopers(): void {
    this.developerService.getDevelopers().subscribe({
      next: (developers) => {
        this.developers = developers;
      },
      error: (error) => {
        console.error('Error loading developers:', error);
      }
    });
  }
}
