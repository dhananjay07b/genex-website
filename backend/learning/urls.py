from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"me/courses", views.MyCourseViewSet, basename="my-course")

urlpatterns = [
    path("roles/", views.CareerRoleListView.as_view(), name="career-role-list"),
    path("courses/", views.CourseListView.as_view(), name="course-list"),
    path("courses/<slug:slug>/", views.CourseDetailView.as_view(), name="course-detail"),
    path("courses/<slug:slug>/enroll/", views.EnrollView.as_view(), name="course-enroll"),
    path("courses/<slug:slug>/related/", views.CourseRelatedView.as_view(), name="course-related"),
    path("courses/<slug:slug>/reviews/", views.CourseReviewListView.as_view(), name="course-reviews"),
    path("courses/<slug:slug>/reviews/me/", views.MyCourseReviewView.as_view(), name="course-review-mine"),
    path("courses/<slug:slug>/items/<int:item_id>/complete/", views.ItemCompleteView.as_view(), name="course-item-complete"),
    path("me/enrollments/", views.MyEnrollmentsView.as_view(), name="my-enrollments"),
    path("me/library/", views.MyLibraryView.as_view(), name="my-library"),
    path("me/company-professionals/", views.CompanyProfessionalsView.as_view(), name="company-professionals"),
    *router.urls,
]
