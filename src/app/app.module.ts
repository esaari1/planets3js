import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { EarthComponent } from './earth/earth.component';
import { MarsComponent } from './mars/mars.component';
import { PlanetSettingsComponent } from './planet-settings/planet-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    EarthComponent,
    MarsComponent,
    PlanetSettingsComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: 'earth', component: EarthComponent },
      { path: 'mars', component: MarsComponent },
      { path: '', redirectTo: '/earth', pathMatch: 'full' }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
