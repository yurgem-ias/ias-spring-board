import { TaskApiService } from './../../../../core/services/task-api.service';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SprintTask } from '../../../../core/models/sprint-task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss',
})
export class TaskDetail implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly api = inject(TaskApiService)
  private router = inject(Router)

  protected readonly task = signal<SprintTask | null>(null)
  protected readonly loading = signal<boolean>(true)
  protected readonly error = signal<string | null>(null)

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.loading.set(true)
      this.error.set(null)
      this.api.getTaskById(id).subscribe({
        next: (t) => {
          this.task.set(t)
          this.loading.set(false)
        },
        error: (err) => {
          this.error.set('La tarea seleccionada no existe o no pudo ser cargada.')
          this.loading.set(false)
        }
      })
    } else{
      this.error.set('ID de tarea no valido')
      this.loading.set(false)
    }
  }
}
