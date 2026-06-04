import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SprintTask } from "../models/sprint-task.model";

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = '/api/tasks'

  getTasks(): Observable<SprintTask[]> {
    return this.http.get<SprintTask[]>(this.baseUrl)
  }

  getTaskById(id: string): Observable<SprintTask> {
    return this.http.get<SprintTask>(`${this.baseUrl}/${id}`)
  }

  createTask(task: Omit<SprintTask, 'id' | 'createdAt' | 'updatedAt'>): Observable<SprintTask> {
    return this.http.post<SprintTask>(this.baseUrl, task)
  }

  updateTask(id: string, task: Partial<SprintTask>): Observable<SprintTask> {
    return this.http.put<SprintTask>(`${`${this.baseUrl}/${id}`}`, task)
  }
}
