"""
Rich text saved from the GeLearn editor before pages.richtext.wagtail_block_shape
existed has <p> inside list items and quotes, which Wagtail's editor splits apart
when the item is opened and saved in the CMS. Reshape what's stored.
"""
from django.db import migrations


def reshape(apps, schema_editor):
    from pages.richtext import wagtail_block_shape

    def fix_stream(stream_data, block_type, key=None):
        changed = False
        for block in stream_data:
            if block.get("type") != block_type:
                continue
            if key is None:
                new = wagtail_block_shape(block["value"])
                if new != block["value"]:
                    block["value"], changed = new, True
            else:
                new = wagtail_block_shape(block["value"].get(key, ""))
                if new != block["value"].get(key, ""):
                    block["value"][key], changed = new, True
        return changed

    for post in apps.get_model("pages", "BlogPost").objects.all():
        data = list(post.body.raw_data)
        if fix_stream(data, "rich_text"):
            post.body = data
            post.save(update_fields=["body"])

    for name in ("TechArticle", "CaseStudy"):
        for item in apps.get_model("pages", name).objects.all():
            fields = []
            intro = wagtail_block_shape(item.intro)
            if intro != item.intro:
                item.intro = intro
                fields.append("intro")
            data = list(item.sections.raw_data)
            if fix_stream(data, "section", key="body"):
                item.sections = data
                fields.append("sections")
            if fields:
                item.save(update_fields=fields)


class Migration(migrations.Migration):
    dependencies = [("pages", "0060_gelearn_rich_text_features")]
    operations = [migrations.RunPython(reshape, migrations.RunPython.noop)]
