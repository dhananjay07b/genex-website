from django.apps import AppConfig


class PagesConfig(AppConfig):
    name = 'pages'

    def ready(self):
        from django.db.models.signals import post_delete

        from .models import JobApplication

        def delete_cv_file(sender, instance, **kwargs):
            # A deleted application takes its CV with it (admin delete, bulk delete, shell).
            if instance.cv:
                instance.cv.delete(save=False)

        post_delete.connect(delete_cv_file, sender=JobApplication, weak=False, dispatch_uid="pages.delete_cv_file")
