from rest_framework.permissions import SAFE_METHODS, BasePermission

from accounts.roles import is_admin


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return is_admin(request.user) or obj.author_id == request.user.id
