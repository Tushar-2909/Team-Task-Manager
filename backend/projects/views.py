from django.db.models import Q
from rest_framework import decorators, status, viewsets
from rest_framework.response import Response

from .models import Membership, Project
from .permissions import IsProjectAdminOrReadOnly
from .serializers import MembershipSerializer, ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = (IsProjectAdminOrReadOnly,)

    def get_queryset(self):
        user = self.request.user
        return (
            Project.objects.filter(Q(owner=user) | Q(memberships__user=user))
            .select_related("owner")
            .prefetch_related("memberships__user")
            .distinct()
        )

    @decorators.action(detail=True, methods=["post"], url_path="members")
    def add_member(self, request, pk=None):
        project = self.get_object()
        if not request.user.is_project_admin or project.owner_id != request.user.id:
            return Response({"detail": "Only the project owner admin can add members."}, status=status.HTTP_403_FORBIDDEN)
        serializer = MembershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        membership, _ = Membership.objects.get_or_create(project=project, user=serializer.validated_data["user"])
        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=["delete"], url_path=r"members/(?P<user_id>[^/.]+)")
    def remove_member(self, request, pk=None, user_id=None):
        project = self.get_object()
        if not request.user.is_project_admin or project.owner_id != request.user.id:
            return Response({"detail": "Only the project owner admin can remove members."}, status=status.HTTP_403_FORBIDDEN)
        if str(project.owner_id) == str(user_id):
            return Response({"detail": "Project owner cannot be removed."}, status=status.HTTP_400_BAD_REQUEST)
        Membership.objects.filter(project=project, user_id=user_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
