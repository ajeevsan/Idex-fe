import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastGraphsComponent } from './past-graphs.component';

describe('PastGraphsComponent', () => {
  let component: PastGraphsComponent;
  let fixture: ComponentFixture<PastGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastGraphsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
