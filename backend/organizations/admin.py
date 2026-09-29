from django.contrib import admin
from django.db.models import Count, Q

from .models import Company, CompanyDomain


class CompanyDomainInline(admin.TabularInline):
    model = CompanyDomain
    extra = 1
    min_num = 1


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "domain_list", "staff_count", "tutor_count", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "domains__domain")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [CompanyDomainInline]
    fields = ("name", "slug", "logo", "website", "description", "is_active")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("domains").annotate(
            _staff=Count("members", filter=Q(members__account_type="company"), distinct=True),
            _tutors=Count("members", filter=Q(members__account_type="professional"), distinct=True),
        )

    @admin.display(description="Domains")
    def domain_list(self, obj):
        return ", ".join(d.domain for d in obj.domains.all())

    @admin.display(description="Staff logins", ordering="_staff")
    def staff_count(self, obj):
        return obj._staff

    @admin.display(description="Tutors", ordering="_tutors")
    def tutor_count(self, obj):
        return obj._tutors
