from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Membership, Project

User = get_user_model()


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source="user", write_only=True)

    class Meta:
        model = Membership
        fields = ("id", "user", "user_id", "created_at")
        read_only_fields = ("id", "created_at")


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Project
        fields = ("id", "name", "description", "owner", "members", "member_ids", "created_at", "updated_at")
        read_only_fields = ("id", "owner", "members", "created_at", "updated_at")

    def get_members(self, obj):
        users = User.objects.filter(memberships__project=obj).order_by("username")
        return UserSerializer(users, many=True).data

    def create(self, validated_data):
        members = validated_data.pop("member_ids", [])
        owner = self.context["request"].user
        if not owner.is_project_admin:
            owner.role = User.Roles.ADMIN
            owner.save(update_fields=["role"])
        project = Project.objects.create(owner=owner, **validated_data)
        Membership.objects.get_or_create(project=project, user=project.owner)
        for user in members:
            Membership.objects.get_or_create(project=project, user=user)
        return project

    def update(self, instance, validated_data):
        members = validated_data.pop("member_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if members is not None:
            Membership.objects.filter(project=instance).exclude(user=instance.owner).delete()
            for user in members:
                Membership.objects.get_or_create(project=instance, user=user)
        return instance
