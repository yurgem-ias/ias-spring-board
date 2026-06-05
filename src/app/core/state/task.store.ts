import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { TaskApiService } from "../services/task-api.service";
import { SprintSummary, SprintTask, TaskStatus, TaskPriority } from "../models/sprint-task.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  private readonly api = inject(TaskApiService)
  private readonly destroyRef = inject(DestroyRef)

  readonly tasks = signal<SprintTask[]>([])
  readonly loading = signal<boolean>(false)
  readonly error = signal<string | null>(null)
  readonly search = signal<string>('')
  readonly status = signal<TaskStatus | 'all'>('all')
  readonly priority = signal<TaskPriority | 'all'>('all')

  readonly filteredTasks = computed<SprintTask[]>(() => {
    const allTasks = this.tasks()
    const searchTerm = this.search().trim().toLowerCase()
    const activeStatus = this.status()
    const activePriority = this.priority()

    return allTasks.filter(task => {
      const matchesSearch = !searchTerm ||
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.assignee.toLowerCase().includes(searchTerm) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm))

      const matchesStatus = activeStatus === 'all' || task.status === activeStatus

      const matchesPriority = activePriority === 'all' || task.priority === activePriority

      return matchesSearch && matchesStatus && matchesPriority
    })
  })

  readonly summary = computed<SprintSummary>(() => {
    const allTasks = this.tasks()
    const total = allTasks.length

    const todo = allTasks.filter(t => t.status === 'todo').length
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length
    const blocked = allTasks.filter(t => t.status === 'blocked').length
    const done = allTasks.filter(t => t.status === 'done').length

    const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0

    return {
      total,
      todo,
      inProgress,
      blocked,
      done,
      completionPercentage
    }
  })

  load(): void {
    this.loading.set(true)
    this.error.set(null)

    this.api.getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.tasks.set(data)
          this.loading.set(false)
        },
        error: (err) => {
          this.error.set('No se pudieron cargar las tareas. Por favor, intente de nuevo.')
          this.loading.set(false)
        }
      })
  }

  create(
    task: Omit<SprintTask, 'id' | 'createdAt' | 'updatedAt'>,
    onSuccess?: (created: SprintTask) => void
  ): void {
    this.loading.set(true)
    this.error.set(null)

    this.api.createTask(task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.tasks.update(list => [...list, created])
          this.loading.set(false)
          if (onSuccess) onSuccess(created)
        },
        error: (err) => {
          this.error.set('No se pudo crear la tarea. Verifique los campos e intente de nuevo.')
          this.loading.set(false)
        }
      })
  }

  update(
    id: string,
    taskChanges: Partial<SprintTask>,
    onSuccess?: (created: SprintTask) => void
  ): void {
    this.loading.set(true)
    this.error.set(null)

    this.api.updateTask(id, taskChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.tasks.update(list => list.map(t => t.id === id ? updated : t))
          this.loading.set(false)
          if (onSuccess) onSuccess(updated)
        },
        error: (err) => {
          this.error.set('No se pudo actualizar la tarea. Verifique los campos e intente de nuevo.')
          this.loading.set(false)
        }
      })
  }

  setSearch(value: string): void {
    this.search.set(value)
  }

  setStatus(value: TaskStatus | 'all'): void {
    this.status.set(value)
  }

  setPriority(value: TaskPriority | 'all'): void {
    this.priority.set(value)
  }
}
