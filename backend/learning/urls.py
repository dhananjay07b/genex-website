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
    path("courses/<slug:slug>/reviews/<int:review_id>/reply/", views.ReviewReplyView.as_view(), name="course-review-reply"),
    path("courses/<slug:slug>/items/<int:item_id>/open/", views.ItemOpenView.as_view(), name="course-item-open"),
    path("certificates/", views.PublicCertificatesView.as_view(), name="public-certificates"),
    path("certificates/<str:code>/", views.CertificateView.as_view(), name="certificate"),
    path("certificates/<str:code>/pdf/", views.CertificatePdfView.as_view(), name="certificate-pdf"),
    path("certificates/<str:code>/image.png", views.CertificateImageView.as_view(), name="certificate-image"),
    path("certificates/<str:code>/share/", views.CertificateShareView.as_view(), name="certificate-share"),
    path("me/certificates/", views.MyCertificatesView.as_view(), name="my-certificates"),
    path("me/enrollments/", views.MyEnrollmentsView.as_view(), name="my-enrollments"),
    path("me/library/", views.MyLibraryView.as_view(), name="my-library"),
    path("me/company-professionals/", views.CompanyProfessionalsView.as_view(), name="company-professionals"),
    *router.urls,
]
