import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskForm } from './task-form';
import { TaskStore } from '../../../../core/state/task.store';
import { TaskApiService } from '../../../../core/services/task-api.service';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

describe('TaskForm', () => {
  let component: TaskForm
  let fixture: ComponentFixture<TaskForm>
  let apiServiceMock: jasmine.SpyObj<TaskApiService>
  let storeMock: jasmine.SpyObj<TaskStore>
  let router: Router

  beforeEach(async () => {
    apiServiceMock = jasmine.createSpyObj('TaskApiService', ['getTaskById', 'createTask', 'updateTask']);
    storeMock = jasmine.createSpyObj('TaskStore', ['create', 'update', 'tasks', 'error']);
    (storeMock as any).tasks = () => [];
    (storeMock as any).error = { set: jasmine.createSpy('set') };

    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [
        { provide: TaskApiService, useValue: apiServiceMock },
        { provide: TaskStore, useValue: storeMock },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate')
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe validar el formulario como inválido si los campos están vacíos', () => {
    expect(component['taskForm'].invalid).toBeTrue();
  });

  it('debe fallar la validación si el título tiene menos de 5 caracteres', () => {
    const titleControl = component['taskForm'].controls.title;
    titleControl.setValue('Hola');
    expect(titleControl.errors?.['minlength']).toBeTruthy();
  });

  it('debe fallar la validación si la descripción tiene menos de 20 caracteres', () => {
    const descControl = component['taskForm'].controls.description;
    descControl.setValue('Corta');
    expect(descControl.errors?.['minlength']).toBeTruthy();
  });

  it('debe fallar la validación si la fecha límite es anterior a hoy', () => {
    const dateControl = component['taskForm'].controls.dueDate;
    dateControl.setValue('2000-01-01');
    expect(dateControl.errors?.['pastDate']).toBeTruthy();
  });

  it('debe marcar el formulario como válido si todos los datos cumplen las reglas', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    component['taskForm'].patchValue({
      title: 'Crear layout principal',
      description: 'Esta es una descripcion con mas de 20 caracteres requerida por el formulario.',
      status: 'todo',
      priority: 'high',
      assignee: 'Ana Torres',
      dueDate: todayStr,
      tagsInput: 'ui, design'
    });

    expect(component['taskForm'].valid).toBeTrue();
  });

  it('debe llamar a store.create al guardar en modo creación', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    component['taskForm'].patchValue({
      title: 'Crear layout principal',
      description: 'Esta es una descripcion con mas de 20 caracteres requerida por el formulario.',
      status: 'todo',
      priority: 'high',
      assignee: 'Ana Torres',
      dueDate: todayStr,
      tagsInput: 'ui, design'
    });

    component['onSubmit']();
    expect(storeMock.create).toHaveBeenCalled();
  });
});
