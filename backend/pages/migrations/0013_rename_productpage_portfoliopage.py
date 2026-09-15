from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0012_faqpage_howweworkpage"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="ProductPage",
            new_name="PortfolioPage",
        ),
    ]
