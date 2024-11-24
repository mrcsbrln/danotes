import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'danotes-a3662',
          appId: '1:586319823193:web:75abe12091def5e5640c48',
          storageBucket: 'danotes-a3662.firebasestorage.app',
          apiKey: 'AIzaSyBGLIa6Kd9mhR5ujQDVmmw82cC-DWjc-sQ',
          authDomain: 'danotes-a3662.firebaseapp.com',
          messagingSenderId: '586319823193',
        })
      )
    ),
    importProvidersFrom(provideFirestore(() => getFirestore())),
  ],
};
