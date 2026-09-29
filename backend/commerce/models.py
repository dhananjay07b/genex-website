from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Purchase(models.Model):
    """
    A user's right to open one piece of paid content. Checkout isn't built
    yet — for now Admin can record purchases by hand (e.g. comp access), and
    the payment integration will create these rows later.
    """
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_REFUNDED = "refunded"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_REFUNDED, "Refunded"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="purchases")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content = GenericForeignKey("content_type", "object_id")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    provider = models.CharField(max_length=30, blank=True, help_text="Payment provider, e.g. 'razorpay' or 'manual'.")
    provider_ref = models.CharField(max_length=100, blank=True, help_text="Provider's order/payment id.")
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "content_type", "object_id"])]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "content_type", "object_id"],
                condition=models.Q(status="paid"),
                name="one_paid_purchase_per_item",
            ),
        ]

    def __str__(self):
        return f"{self.user} → {self.content_type.model} #{self.object_id} ({self.status})"
