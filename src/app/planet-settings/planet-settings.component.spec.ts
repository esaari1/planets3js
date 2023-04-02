import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetSettingsComponent } from './planet-settings.component';

describe('PlanetSettingsComponent', () => {
  let component: PlanetSettingsComponent;
  let fixture: ComponentFixture<PlanetSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanetSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
