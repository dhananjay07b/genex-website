from django.db import models


class Enquiry(models.Model):
    """
    A message sent from the marketing site's Contact form (including job
    applications from Careers → Apply). Saved first, then emailed to the Genex
    inbox, so a message is never lost if email isn't working.
    """
    STATUS_NEW = "new"
    STATUS_HANDLED = "handled"
    STATUS_CHOICES = [(STATUS_NEW, "New"), (STATUS_HANDLED, "Handled")]

    name = models.CharField(max_length=120)
    company = models.CharField(max_length=160, blank=True, help_text="Required for enquiries; optional for job applications.")
    email = models.EmailField()
    phone = models.CharField(max_length=40)
    project_type = models.CharField(max_length=120, verbose_name="enquiry type")
    subject = models.CharField(
        max_length=200, blank=True,
        help_text="What the visitor came about when the form was opened from a link, e.g. \"Application: Solar Engineer\".",
    )
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_NEW, db_index=True)
    email_sent = models.BooleanField(default=False, help_text="Whether the copy to the Genex inbox was sent.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "enquiries"

    def __str__(self):
        return f"{self.name} ({self.company}): {self.subject or self.project_type}"
