from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import decorators, filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from projects.models import Membership
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("title", "description", "project__name", "assigned_to__username")
    ordering_fields = ("due_date", "created_at", "updated_at")

    def get_queryset(self):
        user = self.request.user
        project_scope = Q(project__owner=user) | Q(project__memberships__user=user)
        task_scope = project_scope if user.is_project_admin else Q(assigned_to=user)
        queryset = (
            Task.objects.filter(task_scope)
            .select_related("project", "project__owner", "assigned_to")
            .prefetch_related("project__memberships__user")
            .distinct()
        )
        project_id = self.request.query_params.get("project")
        status_value = self.request.query_params.get("status")
        due = self.request.query_params.get("due")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if due == "overdue":
            queryset = queryset.filter(due_date__lt=timezone.localdate()).exclude(status=Task.Status.DONE)
        return queryset

    @decorators.action(detail=False, methods=["get"])
    def dashboard(self, request):
        queryset = self.get_queryset()
        today = timezone.localdate()
        by_status = queryset.values("status").annotate(total=Count("id")).order_by("status")
        per_user = (
            queryset.values("assigned_to", "assigned_to__username")
            .annotate(total=Count("id"))
            .order_by("assigned_to__username")
        )
        payload = {
            "total_tasks": queryset.count(),
            "completed_tasks": queryset.filter(status=Task.Status.DONE).count(),
            "overdue_tasks": queryset.filter(due_date__lt=today).exclude(status=Task.Status.DONE).count(),
            "by_status": list(by_status),
            "tasks_per_user": [
                {
                    "user_id": item["assigned_to"],
                    "username": item["assigned_to__username"] or "Unassigned",
                    "total": item["total"],
                }
                for item in per_user
            ],
            "due_soon": TaskSerializer(queryset.filter(due_date__gte=today).order_by("due_date")[:5], many=True).data,
        }
        return Response(payload)

    def perform_create(self, serializer):
        if not self.request.user.is_project_admin:
            raise PermissionDenied("Only admins can create tasks.")
        serializer.save()

    def perform_update(self, serializer):
        if not self.request.user.is_project_admin:
            task = self.get_object()
            if task.assigned_to_id != self.request.user.id:
                raise PermissionDenied("Members can update assigned tasks only.")
            disallowed = set(self.request.data) - {"status"}
            if disallowed:
                raise PermissionDenied("Members can update task status only.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_project_admin:
            raise PermissionDenied("Only admins can delete tasks.")
        instance.delete()

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.user.is_project_admin:
            is_member = obj.project.owner_id == request.user.id or Membership.objects.filter(project=obj.project, user=request.user).exists()
        else:
            is_member = obj.assigned_to_id == request.user.id
        if not is_member:
            self.permission_denied(request, message="You can access assigned tasks only.")
