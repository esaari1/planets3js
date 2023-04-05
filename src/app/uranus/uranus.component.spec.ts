import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UranusComponent } from './uranus.component';

describe('UranusComponent', () => {
  let component: UranusComponent;
  let fixture: ComponentFixture<UranusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UranusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UranusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
