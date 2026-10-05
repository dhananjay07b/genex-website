from django import forms
from django.contrib import messages
from django.db.models import Count
from django.templatetags.static import static
from django.utils.html import format_html
from django.utils.text import capfirst
from wagtail import hooks
from wagtail.admin.ui.tables import Column
from wagtail.snippets.bulk_actions.snippet_bulk_action import SnippetBulkAction
from wagtail.snippets.models import register_snippet
from wagtail.snippets.permissions import get_permission_name
from wagtail.snippets.views.snippets import SnippetViewSet

from .links import company_chooser_viewset, course_chooser_viewset
from .models import Topic, TopicGroup
from .topics import merge_topics, with_usage

AUDITED_MODELS = ("Tender", "Whitepaper", "CaseStudy")


def _record_updated_by(request, instance):
    if type(instance).__name__ in AUDITED_MODELS and request.user.is_authenticated:
        instance.updated_by = request.user
        instance.save(update_fields=["updated_by"])


@hooks.register("after_create_snippet")
def set_updated_by_on_create(request, instance):
    _record_updated_by(request, instance)


@hooks.register("after_edit_snippet")
def set_updated_by_on_edit(request, instance):
    _record_updated_by(request, instance)


# ── Topics: usage counts, group filter, and "Merge into…" ────────────────────


class TopicViewSet(SnippetViewSet):
    model = Topic
    icon = "tag"
    list_display = ["name", "group", "sort_order", Column("usage", label="Used by")]
    list_filter = ["group"]
    search_fields = ["name"]
    ordering = ["group__sort_order", "sort_order", "name"]

    def get_queryset(self, request):
        return with_usage(Topic.objects.select_related("group"))


class TopicGroupViewSet(SnippetViewSet):
    model = TopicGroup
    icon = "folder-open-inverse"
    list_display = ["name", "sort_order", Column("topic_count", label="Topics")]

    def get_queryset(self, request):
        return TopicGroup.objects.annotate(topic_count=Count("topics"))


register_snippet(TopicGroupViewSet)
register_snippet(TopicViewSet)


class MergeTopicsForm(forms.Form):
    target = forms.ModelChoiceField(
        queryset=Topic.objects.select_related("group").order_by("name"),
        label="Merge into",
        help_text="Everything tagged with the selected topics moves to this topic, then they are deleted.",
    )


@hooks.register("register_bulk_action")
class MergeTopicsBulkAction(SnippetBulkAction):
    display_name = "Merge into…"
    action_type = "merge_topics"
    aria_label = "Merge selected topics into another topic"
    template_name = "pages/bulk_actions/merge_topics.html"
    form_class = MergeTopicsForm
    action_priority = 40
    models = [Topic]

    def check_perm(self, obj):
        return self.request.user.has_perm(get_permission_name("delete", Topic))

    def annotate_items(self, items):
        return list(with_usage(Topic.objects.filter(pk__in=[t.pk for t in items])))

    def object_context(self, obj):
        return {**super().object_context(obj), "usage": obj.usage}

    def prepare_action(self, objects, objects_without_access):
        target = self.cleaned_form.cleaned_data["target"]
        if all(t.pk == target.pk for t in objects):
            messages.error(self.request, "Choose a different topic to merge into.")
            return self.form_invalid(self.cleaned_form)

    def get_execution_context(self):
        return {**super().get_execution_context(), "target": self.cleaned_form.cleaned_data["target"]}

    @classmethod
    def execute_action(cls, objects, target=None, **kwargs):
        sources = [t for t in objects if t.pk != target.pk]
        merge_topics(sources, target)
        return len(sources), 0

    def get_success_message(self, num_parent_objects, num_child_objects):
        target = self.cleaned_form.cleaned_data["target"]
        noun = capfirst(Topic._meta.verbose_name if num_parent_objects == 1 else Topic._meta.verbose_name_plural)
        return f'{num_parent_objects} {noun.lower()} merged into "{target}".'


# ── Link picker (pages/links.py): course and company choosers, editor script ─

@hooks.register("register_admin_viewset")
def register_link_choosers():
    return [company_chooser_viewset, course_chooser_viewset]


@hooks.register("insert_editor_js")
def link_block_js():
    return format_html('<script src="{}"></script>', static("pages/js/link_block.js"))
