from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView, RegisterView, UserListView

def api_root(request):
    return JsonResponse({"message": "API is working"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/users/", UserListView.as_view(), name="users"),
    path("api/projects/", include("projects.urls")),
    path("api/tasks/", include("tasks.urls")),
]
