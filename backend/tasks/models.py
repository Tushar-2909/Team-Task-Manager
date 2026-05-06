from django.conf import settings
from django.db import models
from django.utils import timezone

from projects.models import Project


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "TODO", "Todo"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        DONE = "DONE", "Done"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        URGENT = "URGENT", "Urgent"

    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="assigned_tasks",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    due_date = models.DateField(null=True, blank=True)
    project = models.ForeignKey(Project, related_name="tasks", on_delete=models.CASCADE)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="created_tasks",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("due_date", "-created_at")

    @property
    def is_overdue(self):
        return bool(self.due_date and self.due_date < timezone.localdate() and self.status != self.Status.DONE)

    def __str__(self):
        return self.title
