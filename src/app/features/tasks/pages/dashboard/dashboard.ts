import { Component, inject, OnInit } from '@angular/core';
import { TaskStore } from '../../../../core/state/task.store';
import { TaskStatus } from '../../../../core/models/sprint-task.model';
import { TaskPriority } from '../../../../core/models/sprint-task.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  protected readonly store = inject(TaskStore);

  ngOnInit(): void {
    if (this.store.tasks().length === 0) {
      this.store.load()
    }
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement
    this.store.setSearch(target.value)
  }

  protected onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    this.store.setStatus(target.value as TaskStatus | 'all')
  }

  protected onPriorityChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    this.store.setPriority(target.value as TaskPriority | 'all')
  }

  protected retryLoading(): void{
    this.store.load()
  }
}
