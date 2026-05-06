from rest_framework import permissions

from .models import Membership


class IsAdminUserRole(permissions.BasePermission):
    message = "Only admins can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_project_admin)


class IsProjectMember(permissions.BasePermission):
    message = "You must be a project member."

    def has_object_permission(self, request, view, obj):
        project = getattr(obj, "project", obj)
        return project.owner_id == request.user.id or Membership.objects.filter(project=project, user=request.user).exists()


class IsProjectAdminOrReadOnly(permissions.BasePermission):
    message = "Only project admins can manage projects."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        if request.method == "POST":
            return request.user and request.user.is_authenticated
        return bool(request.user and request.user.is_authenticated and request.user.is_project_admin)

    def has_object_permission(self, request, view, obj):
        is_member = obj.owner_id == request.user.id or Membership.objects.filter(project=obj, user=request.user).exists()
        if request.method in permissions.SAFE_METHODS:
            return is_member
        return request.user.is_project_admin and obj.owner_id == request.user.id
