import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tasks'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./features/tasks/pages/task-form/task-form').then(m => m.TaskForm)
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./features/tasks/pages/task-detail/task-detail').then(m => m.TaskDetail)
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () => import('./features/tasks/pages/task-form/task-form').then(m => m.TaskForm)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/pages/not-found/not-found').then(m => m.NotFound)
  },
];
