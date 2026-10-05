"""
Sets "Show to" on the seeded GeLearn promos: "Ask Genex to make you a
Professional" and "Members-only content is open to you" only make sense for
Learners. Other promos stay "Everyone". Page and every revision; reversible.
"""
import json

from django.db import migrations

LEARNER_ONLY = {"Ask Genex to make you a Professional", "Members-only content is open to you"}


def _set(stream, audience_for):
    for block in stream:
        if block.get("type") != "promo_pair":
            continue
        for item in block.get("value", {}).get("promos", []):
            promo = item.get("value", item) if isinstance(item, dict) else item
            if isinstance(promo, dict) and promo.get("heading") in LEARNER_ONLY:
                promo["audience"] = audience_for(promo)
    return stream


def _run(apps, audience_for):
    GeLearnIndexPage = apps.get_model("pages", "GeLearnIndexPage")
    Revision = apps.get_model("wagtailcore", "Revision")
    ContentType = apps.get_model("contenttypes", "ContentType")
    content_type = ContentType.objects.filter(app_label="pages", model="gelearnindexpage").first()
    for page in GeLearnIndexPage.objects.all():
        page.member_sections = _set(json.loads(json.dumps(list(page.member_sections.raw_data))), audience_for)
        page.save(update_fields=["member_sections"])
        if content_type is None:
            continue
        for rev in Revision.objects.filter(content_type=content_type, object_id=str(page.pk)):
            content = dict(rev.content)
            stream = content.get("member_sections")
            if isinstance(stream, str) and stream:
                content["member_sections"] = json.dumps(_set(json.loads(stream), audience_for))
                rev.content = content
                rev.save(update_fields=["content"])


def forwards(apps, schema_editor):
    _run(apps, lambda promo: "learner")


def backwards(apps, schema_editor):
    _run(apps, lambda promo: "everyone")


class Migration(migrations.Migration):

    dependencies = [("pages", "0046_promo_audience")]

    operations = [migrations.RunPython(forwards, backwards)]
