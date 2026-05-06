from django.contrib import admin

from .models import Membership, Project


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = (MembershipInline,)
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "owner__username")


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "created_at")
    search_fields = ("project__name", "user__username")
