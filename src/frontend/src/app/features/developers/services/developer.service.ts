import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Developer } from '../models/developer.model';
import { developerList } from '../data/developer.data';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {

  constructor() { }

  /**
   * Obtiene todos los desarrolladores
   * En el futuro se reemplazará por una llamada HTTP a una API
   */
  getDevelopers(): Observable<Developer[]> {
    // Simula procesamiento de datos (agregar imagen por defecto si no existe)
    const processedDevelopers = developerList.map(dev => ({
      ...dev,
      imageUrl: dev.imageUrl || '/assets/images/avatar_blank.png'
    }));

    return of(processedDevelopers);
  }

  /**
   * Obtiene un desarrollador por ID
   * Preparado para futuras implementaciones
   */
  getDeveloperById(id: string): Observable<Developer | undefined> {
    const developer = developerList.find((dev, index) => index.toString() === id);
    return of(developer);
  }

  /**
   * Busca desarrolladores por tecnología
   */
  getDevelopersByTechnology(technology: string): Observable<Developer[]> {
    const filteredDevelopers = developerList.filter(dev =>
      dev.technologies?.some(tech => tech === technology)
    );
    return of(filteredDevelopers);
  }
}
