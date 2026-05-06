from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, token_payload_for_user


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(token_payload_for_user(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(token_payload_for_user(serializer.validated_data["user"]))


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.filter(is_active=True).order_by("username")
