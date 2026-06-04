import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { SprintTask } from "../../../models/sprint-task.model";
import { delay, max, Observable, of, throwError } from "rxjs";


const STORAGE_KEY = "ias_spring_board_tasks";

const INITIAL_TASKS: SprintTask[] = [
  {
    id: 'TASK-01',
    title: 'Crear layout del dashboard',
    description: 'Definir estructura visual y navegacion principal utilizando componentes standalone y valiables CSS.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Andrea Puerta',
    dueDate: '2026-06-10',
    tags: ['ui', 'dahsboard'],
    createdAt: '2026-06-01',
    updatedAt: '2026-06-02'
  }, {
    id: 'TASK-02',
    title: 'Conectar service de tareas',
    description: 'Implementar capa HTTP tipada con mnanejo de errores y pruebas unitarias de integracion.',
    status: 'todo',
    priority: 'critical',
    assignee: 'Carlos Martines',
    dueDate: '2026-06-08',
    tags: ['http', 'architecture'],
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01'
  }, {
    id: 'TASK-03',
    title: 'Diseñar esquema de base de datos',
    description: 'Modelar las entidades de tareas, usuarios e historial para el sprint de desarrollo.',
    status: 'blocked',
    priority: 'medium',
    assignee: 'Yurgen Prado',
    dueDate: '2026-06-15',
    tags: ['http', 'architecture'],
    createdAt: '2026-06-01',
    updatedAt: '2026-06-04'
  }
]

function getTasks(): SprintTask[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS))
    return INITIAL_TASKS
  }
  return JSON.parse(data)
}

function saveTasks(tasks: SprintTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function mockApiinterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const request = req
  const url = request.url
  const method = request.method

  if (url.includes('/api/tasks')) {
    const tasks = getTasks()

    const mathDetail = url.match(/\/api\/tasks\/([A-Z0-9-]+)$/)
    if (mathDetail && method === 'GET') {
      const id = mathDetail[1]
      const task = tasks.find(t => t.id === id)
      if (task) {
        return of(new HttpResponse({ status: 200, body: task })).pipe(delay(400))
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 400,
          statusText: 'Not Found',
          url: url,
          error: `Task with ID ${id} not found`
        })).pipe(delay(400))
      }
    }

    if (mathDetail && method === 'PUT') {
      const id = mathDetail[1]
      const taskIndex = tasks.findIndex(t => t.id === id)
      if (taskIndex !== -1) {
        const body = request.body as Partial<SprintTask>
        const updatedTask: SprintTask = {
          ...tasks[taskIndex],
          ...body,
          id,
          updatedAt: new Date().toISOString()
        }
        tasks[taskIndex] = updatedTask
        saveTasks(tasks)
        return of(new HttpResponse({ status: 200, body: updatedTask })).pipe(delay(400))
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          url: url,
          error: `Task with ID ${id} not found`
        })).pipe(delay(400))
      }
    }

    if (method === 'GET') {
      return of(new HttpResponse({ status: 200, body: tasks })).pipe(delay(400))
    }

    if (method === 'POST') {
      const body = request.body as Omit<SprintTask, 'id' | 'createdAt' | 'updatedAt'>
      const nextIdNum = tasks.reduce((max, t) => {
        const match = t.id.match(/TASK-(\d+)/)
        if (match) {
          const num = parseInt(match[1], 10)
          return num > max ? num : max
        }
        return max
      }, 100) + 1

      const newTask: SprintTask = {
        ...body,
        id: `TASK-${nextIdNum}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      tasks.push(newTask)
      saveTasks(tasks)
      return of(new HttpResponse({ status: 201, body: newTask })).pipe(delay(400))
    }

  }
  return next(req)
}
