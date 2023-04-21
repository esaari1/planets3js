import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { EarthComponent } from './earth/earth.component';
import { MarsComponent } from './mars/mars.component';
import { PlanetSettingsComponent } from './planet-settings/planet-settings.component';
import { JupiterComponent } from './jupiter/jupiter.component';
import { SaturnComponent } from './saturn/saturn.component';
import { UranusComponent } from './uranus/uranus.component';
import { SystemComponent } from './system/system.component';
import { Test1Component } from './test1/test1.component';
import { LandscapeComponent } from './landscape/landscape.component';

@NgModule({
  declarations: [
    AppComponent,
    EarthComponent,
    MarsComponent,
    PlanetSettingsComponent,
    JupiterComponent,
    SaturnComponent,
    UranusComponent,
    SystemComponent,
    Test1Component,
    LandscapeComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', component: SystemComponent },
      { path: 'earth', component: EarthComponent },
      { path: 'mars', component: MarsComponent },
      { path: 'jupiter', component: JupiterComponent },
      { path: 'saturn', component: SaturnComponent },
      { path: 'uranus', component: UranusComponent },
      { path: 'test1', component: Test1Component },
      { path: 'landscape', component: LandscapeComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
