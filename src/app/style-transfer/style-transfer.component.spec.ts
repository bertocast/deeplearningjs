import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleTransferComponent } from './style-transfer.component';

describe('StyleTransferComponent', () => {
  let component: StyleTransferComponent;
  let fixture: ComponentFixture<StyleTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
