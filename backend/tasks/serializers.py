from rest_framework import serializers

from accounts.serializers import UserSerializer
from projects.models import Membership, Project
from projects.serializers import ProjectSerializer
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), source="project", write_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "assigned_to",
            "assigned_to_id",
            "due_date",
            "project",
            "project_id",
            "is_overdue",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "project", "assigned_to", "is_overdue", "created_at", "updated_at")

    def validate_project(self, project):
        request = self.context["request"]
        is_member = project.owner_id == request.user.id or Membership.objects.filter(project=project, user=request.user).exists()
        if not is_member:
            raise serializers.ValidationError("You are not a member of this project.")
        return project

    def validate(self, attrs):
        request = self.context["request"]
        project = attrs.get("project") or getattr(self.instance, "project", None)
        if project:
            is_member = project.owner_id == request.user.id or Membership.objects.filter(project=project, user=request.user).exists()
            if not is_member:
                raise serializers.ValidationError({"project_id": "You can create tasks only inside your projects."})
        assigned_to_id = attrs.pop("assigned_to_id", serializers.empty)
        if assigned_to_id is not serializers.empty:
            if assigned_to_id is None:
                attrs["assigned_to"] = None
            elif not Membership.objects.filter(project=project, user_id=assigned_to_id).exists():
                raise serializers.ValidationError({"assigned_to_id": "Assignee must be a project member."})
            else:
                attrs["assigned_to_id"] = assigned_to_id
        return attrs

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
