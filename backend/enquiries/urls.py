from django.urls import path

from .views import EnquiryCreateView, JobApplicationCreateView

urlpatterns = [
    path("", EnquiryCreateView.as_view(), name="enquiry-create"),
    path("applications/", JobApplicationCreateView.as_view(), name="job-application-create"),
]
