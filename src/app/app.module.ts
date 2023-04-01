import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { EarthComponent } from './earth/earth.component';

@NgModule({
  declarations: [
    AppComponent,
    EarthComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: 'earth', component: EarthComponent },
      { path: '', redirectTo: '/earth', pathMatch: 'full' }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
