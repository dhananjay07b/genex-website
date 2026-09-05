from rest_framework.throttling import ScopedRateThrottle


class CommentCreateThrottle(ScopedRateThrottle):
    scope = "comment-create"
