from rest_framework.permissions import BasePermission


class HasMinimumTier(BasePermission):
    """Usage: set `required_tier_rank` on the view, or subclass with a fixed rank."""
    required_tier_rank = 0

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        rank = getattr(view, "required_tier_rank", self.required_tier_rank)
        return request.user.membership_tier.rank >= rank
