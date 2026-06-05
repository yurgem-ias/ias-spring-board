import { TestBed } from '@angular/core/testing';
import { TaskStore } from './task.store';
import { TaskApiService } from '../services/task-api.service';
import { of, throwError } from 'rxjs';
import { SprintTask } from '../models/sprint-task.model';

describe('TaskStore', () => {
  let store: TaskStore;
  let apiServiceMock: jasmine.SpyObj<TaskApiService>;

  const mockTasks: SprintTask[] = [
    {
      id: 'TASK-101',
      title: 'Crear layout del dashboard',
      description: 'Definir estructura visual y navegación principal.',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Ana Torres',
      dueDate: '2026-06-10',
      tags: ['ui', 'dashboard'],
      createdAt: '2026-06-01T09:00:00.000Z',
      updatedAt: '2026-06-02T15:20:00.000Z'
    },
    {
      id: 'TASK-102',
      title: 'Conectar servicio de tareas',
      description: 'Implementar capa HTTP tipada con manejo de errores.',
      status: 'todo',
      priority: 'critical',
      assignee: 'Carlos Ruiz',
      dueDate: '2026-06-08',
      tags: ['http', 'architecture'],
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-01T10:00:00.000Z'
    },
    {
      id: 'TASK-103',
      title: 'Pruebas del backend',
      description: 'Configurar suite de pruebas y mocks.',
      status: 'done',
      priority: 'low',
      assignee: 'Ana Torres',
      dueDate: '2026-06-12',
      tags: ['testing'],
      createdAt: '2026-06-01T11:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z'
    }
  ];

  beforeEach(() => {
    apiServiceMock = jasmine.createSpyObj('TaskApiService', ['getTasks', 'createTask', 'updateTask']);
    apiServiceMock.getTasks.and.returnValue(of(mockTasks));

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskApiService, useValue: apiServiceMock }
      ]
    });

    store = TestBed.inject(TaskStore);
  });

  it('debe crearse correctamente el store con valores iniciales', () => {
    expect(store).toBeTruthy();
    expect(store.tasks()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.search()).toBe('');
    expect(store.status()).toBe('all');
    expect(store.priority()).toBe('all');
  });

  it('debe cargar las tareas exitosamente y apagar loading', () => {
    store.load();
    expect(apiServiceMock.getTasks).toHaveBeenCalled();
    expect(store.tasks()).toEqual(mockTasks);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('debe registrar error si la carga de la API falla', () => {
    apiServiceMock.getTasks.and.returnValue(throwError(() => new Error('Error de conexión')));
    store.load();
    expect(store.tasks()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toContain('No se pudieron cargar las tareas');
  });

  it('debe filtrar tareas por texto (búsqueda en título, descripción, responsable o tags)', () => {
    store.tasks.set(mockTasks);

    // Buscar por título/descripción
    store.setSearch('layout');
    expect(store.filteredTasks().length).toBe(1);
    expect(store.filteredTasks()[0].id).toBe('TASK-101');

    // Buscar por responsable
    store.setSearch('Ana');
    expect(store.filteredTasks().length).toBe(2);

    // Buscar por tag
    store.setSearch('architecture');
    expect(store.filteredTasks().length).toBe(1);
    expect(store.filteredTasks()[0].id).toBe('TASK-102');
  });

  it('debe filtrar de forma combinada por texto, estado y prioridad', () => {
    store.tasks.set(mockTasks);
    store.setSearch('Ana');
    store.setStatus('in-progress');
    store.setPriority('high');

    expect(store.filteredTasks().length).toBe(1);
    expect(store.filteredTasks()[0].id).toBe('TASK-101');
  });

  it('debe calcular correctamente las métricas en el summary', () => {
    store.tasks.set(mockTasks);
    const summary = store.summary();

    expect(summary.total).toBe(3);
    expect(summary.todo).toBe(1);
    expect(summary.inProgress).toBe(1);
    expect(summary.blocked).toBe(0);
    expect(summary.done).toBe(1);
    expect(summary.completionPercentage).toBe(33); // 1 done de 3 es 33%
  });
});
