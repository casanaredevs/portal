import { Routes } from '@angular/router';

export const pagesRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module')
      .then(m => m.HomeModule),
  },
  {
    path: 'eventos',
    loadChildren: () => import('./events/events.module')
      .then(m => m.EventsModule),
  },
  {
    path: 'contacto',
    loadChildren: () => import('./contact/contact.module')
      .then(m => m.ContactModule),
  },
  {
    path: '**',
    loadComponent: () => import('./page-not-found/page-not-found.component')
      .then(m => m.PageNotFoundComponent)
  }
]
