from wagtail import hooks

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
