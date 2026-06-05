import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TaskStatus, TaskPriority } from '../../../../core/models/sprint-task.model';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TaskStore } from '../../../../core/state/task.store';
import { TaskApiService } from '../../../../core/services/task-api.service';

export const dateMinTodayValidator: ValidatorFn =(control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null
    const todayStr = new Date().toISOString().split('T')[0]
    return control.value < todayStr ? { pastDate: true} : null
  }

interface TaskFormGroup {
  title: FormControl<string>
  description: FormControl<string>
  status: FormControl<TaskStatus>
  priority: FormControl<TaskPriority>
  assignee: FormControl<string>
  dueDate: FormControl<string>
  tagsInput: FormControl<string>
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
 private readonly route = inject(ActivatedRoute)
 private readonly router = inject(Router)
 private readonly store = inject(TaskStore)
 private readonly api = inject(TaskApiService)
 private readonly fb = inject(FormBuilder)

 protected readonly isEditMode = signal<boolean>(false)
 protected readonly taskId = signal<string | null>(null)
 protected readonly loading = signal<boolean>(false)
 protected readonly saving = signal<boolean>(false)

 protected readonly taskForm = new FormGroup<TaskFormGroup>({
  title: new FormControl('',{nonNullable: true, validators: [Validators.required, Validators.minLength(5), Validators.maxLength(80)]}),
  description: new FormControl('', {nonNullable:true, validators: [Validators.required, Validators.minLength(20), Validators.maxLength(500)]}),
  status: new FormControl('todo',{nonNullable:true, validators: [Validators.required]}),
  priority: new FormControl('medium',{nonNullable:true, validators: [Validators.required]}),
  assignee: new FormControl('',{nonNullable:true, validators: [Validators.required, Validators.minLength(3)]}),
  dueDate: new FormControl('',{nonNullable:true, validators: [Validators.required, dateMinTodayValidator]}),
  tagsInput: new FormControl('',{nonNullable:true})
 })

 ngOnInit(): void {
   const id = this.route.snapshot.paramMap.get('id')
   if (id) {
    this.isEditMode.set(true)
    this.taskId.set(id)
    this.loadTaskForEdit(id)
   } else {
    const todayStr = new Date().toISOString().split('T')[0]
    this.taskForm.controls.dueDate.setValue(todayStr)
   }
 }

 private loadTaskForEdit(id: string): void{
  this.loading.set(true)
  this.api.getTaskById(id).subscribe({
    next: (task) => {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate.split('T')[0],
        tagsInput: task.tags.join(', ')
      })
      this.loading.set(false)
    },
    error: (err) => {
      this.store.error.set('No se pudo cargar la tarea para editar')
      this.loading.set(false)
      this.router.navigate(['/tasks'])
    }
  })
 }

 protected onSubmit(): void {
  if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched()
    return
  }

  this.saving.set(true)
  const formValue = this.taskForm.getRawValue()

  const normalizedTags = Array.from(
    new Set(
      formValue.tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)
    )
  )

  const taskData = {
    title: formValue.title,
    description: formValue.description,
    status: formValue.status,
    priority: formValue.priority,
    assignee: formValue.assignee,
    dueDate: formValue.dueDate,
    tags: normalizedTags
  }

  if (this.isEditMode()) {
    const id = this.taskId()!
    this.store.update(id, taskData, () => {
      this.saving.set(false)
      this.router.navigate(['/tasks'])
    })
  } else {
    this.store.create(taskData, () => {
      this.saving.set(false)
      this.router.navigate(['/tasks'])
    })
  }

 }

 protected isFieldInvalid(fieldName: keyof TaskFormGroup): boolean {
  const control = this.taskForm.get(fieldName)
  return !!(control && control.invalid && (control.touched || control.dirty))
 }

 protected getFieldError(fieldName: keyof TaskFormGroup): string {
  const control = this.taskForm.get(fieldName)
  if (!control || !control.errors) return ''

  if (control.errors['required']) {
    return 'Este campo es obligatorio'
  }
  if (control.errors['minlength']) {
    return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`
  }
    if (control.errors['maxlength']) {
    return `No puede superar los ${control.errors['maxlength'].requiredLength} caracteres`
  }
    if (control.errors['pastDate']) {
    return `La fecha límite no puede ser anterior a la fecha actual.`
  }

  return 'Campo inválido.'
 }
}
