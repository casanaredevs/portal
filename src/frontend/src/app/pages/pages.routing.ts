import { Routes } from '@angular/router';

export const pagesRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module')
      .then(m => m.HomeModule),
  },
  {
    path: '**',
    loadComponent: () => import('./page-not-found/page-not-found.component')
      .then(m => m.PageNotFoundComponent)
  }
]