import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth/login',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/register',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/register-institution',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/verify-email',
    renderMode: RenderMode.Client
  },
  {
    path: 'for-donor',
    renderMode: RenderMode.Client
  },
  {
    path: 'for-donor/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'for-institution',
    renderMode: RenderMode.Client
  },
  {
    path: 'for-institution/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
