import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CervantesComponent } from './cervantes.component';

describe('CervantesComponent', () => {
  let component: CervantesComponent;
  let fixture: ComponentFixture<CervantesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CervantesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CervantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
