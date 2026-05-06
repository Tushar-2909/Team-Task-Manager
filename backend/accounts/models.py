from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MEMBER = "MEMBER", "Member"

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.MEMBER)

    @property
    def is_project_admin(self):
        return self.role == self.Roles.ADMIN
