from django.conf import settings
from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owned_projects",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.name


class Membership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="memberships", on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name="memberships", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "project")
        ordering = ("project__name", "user__username")

    def __str__(self):
        return f"{self.user} in {self.project}"
