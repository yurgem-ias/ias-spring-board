import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { TaskStore } from '../../../../core/state/task.store';
import { provideRouter } from '@angular/router';
import { SprintTask, SprintSummary } from '../../../../core/models/sprint-task.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let storeMock: jasmine.SpyObj<TaskStore>;

  const mockTasks: SprintTask[] = [
    {
      id: 'TASK-101',
      title: 'Crear layout del dashboard',
      description: 'Definir estructura visual y navegación principal.',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Ana Torres',
      dueDate: '2026-06-10',
      tags: ['ui'],
      createdAt: '2026-06-01T09:00:00.000Z',
      updatedAt: '2026-06-02T15:20:00.000Z'
    }
  ];

  const mockSummary: SprintSummary = {
    total: 1,
    todo: 0,
    inProgress: 1,
    blocked: 0,
    done: 0,
    completionPercentage: 0
  };

  beforeEach(async () => {
    storeMock = jasmine.createSpyObj('TaskStore', [
      'load',
      'setSearch',
      'setStatus',
      'setPriority'
    ]);

    (storeMock as any).tasks = () => mockTasks;
    (storeMock as any).filteredTasks = () => mockTasks;
    (storeMock as any).loading = () => false;
    (storeMock as any).error = () => null;
    (storeMock as any).search = () => '';
    (storeMock as any).status = () => 'all';
    (storeMock as any).priority = () => 'all';
    (storeMock as any).summary = () => mockSummary;

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: TaskStore, useValue: storeMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar tareas al iniciar si el store está vacío', () => {
    (storeMock as any).tasks = () => [];
    component.ngOnInit();
    expect(storeMock.load).toHaveBeenCalled();
  });

  it('debe llamar a setSearch en el store cuando cambia el buscador', () => {
    const mockEvent = {
      target: { value: 'layout' }
    } as any;

    component['onSearchChange'](mockEvent);
    expect(storeMock.setSearch).toHaveBeenCalledWith('layout');
  });

  it('debe mostrar la lista de tareas en el template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const taskCard = compiled.querySelector('.task-card');
    expect(taskCard).toBeTruthy();
    expect(taskCard?.querySelector('h3')?.textContent).toContain('Crear layout del dashboard');
  });
});
