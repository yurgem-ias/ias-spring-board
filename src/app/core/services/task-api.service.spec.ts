import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskApiService } from './task-api.service';
import { SprintTask } from '../models/sprint-task.model';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';


describe('TaskApiService', () => {
  let service: TaskApiService
  let httpMock: HttpTestingController

  const mockTasks: SprintTask[] = [
    {
      id: 'TASK-01',
      title: 'Crear layout del dashboard',
      description: 'Definir estructura visual y navegacion principal',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Andrea Puerta',
      dueDate: '2026-06-10',
      tags: ['ui', 'dahsboard'],
      createdAt: '2026-06-01',
      updatedAt: '2026-06-02'
    }
  ]

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })

    service = TestBed.inject(TaskApiService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() =>{
    httpMock.verify()
  })

  it('debe crearse el servicio', ()=>{
    expect(service).toBeTruthy()
  })

  it('debe obtener las tareas con GET /api/tasks', () => {
    service.getTasks().subscribe(tasks =>{
      expect(tasks.length).toBe(1)
      expect(tasks[0].id).toBe('TASK-01')
    })

    const req = httpMock.expectOne('/api/tasks')
    expect(req.request.method).toBe('GET')
    req.flush(mockTasks)
  })

  it('debe obtener una tarea por ID con GET /api/tasks/:id', () => {
    service.getTaskById('TASK-01').subscribe(task => {
      expect(task.title).toBe('Crear layout del dashboard')
    })

    const req = httpMock.expectOne('/api/tasks/TASK-01')
    expect(req.request.method).toBe('GET')
    req.flush(mockTasks[0])
  })

  it('debe enviar datis cirrectis oara crear ka tarea con POST /api/tasks', () => {
    const newTaskInput: Omit<SprintTask, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Nueva Tarea de Prueba',
      description: 'Descripcion detallada para la tarea de prueba',
      status: 'todo',
      priority: 'low',
      assignee: 'Camilo Perez',
      dueDate: '2026-06-15',
      tags: ['test'],
    }

    service.createTask(newTaskInput).subscribe(task => {
      expect(task.id).toBe('TASK-02')
    })

    const req = httpMock.expectOne('/api/tasks')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual(newTaskInput)

    req.flush({ ...newTaskInput, id: 'TASK-02', createdAt: '', updatedAt: ''})
  })
})
