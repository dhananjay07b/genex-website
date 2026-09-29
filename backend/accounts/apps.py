from django.apps import AppConfig


def superuser_only_admin(request):
    return request.user.is_active and request.user.is_superuser


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        from django.contrib import admin
        from django.contrib.admin.forms import AdminAuthenticationForm
        from django.core.exceptions import ValidationError

        class SuperuserAuthenticationForm(AdminAuthenticationForm):
            def confirm_login_allowed(self, user):
                super().confirm_login_allowed(user)
                if not user.is_superuser:
                    raise ValidationError(
                        self.error_messages["invalid_login"], code="invalid_login",
                        params={"username": self.username_field.verbose_name},
                    )

        # Django admin normally admits any is_staff user; only the superuser may enter.
        admin.site.has_permission = superuser_only_admin
        admin.site.login_form = SuperuserAuthenticationForm
