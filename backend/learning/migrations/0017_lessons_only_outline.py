import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """A course's outline holds only its own lessons: published content moved to Further reading in 0016."""

    dependencies = [
        ('learning', '0016_move_published_items_to_reading'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_video',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_post',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_article',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_research',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_whitepaper',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_podcast',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_item_exactly_one_target',
        ),
        migrations.RemoveConstraint(
            model_name='playlistitem',
            name='playlist_unique_lesson',
        ),
        migrations.RemoveField(
            model_name='playlistitem',
            name='article',
        ),
        migrations.RemoveField(
            model_name='playlistitem',
            name='podcast',
        ),
        migrations.RemoveField(
            model_name='playlistitem',
            name='post',
        ),
        migrations.RemoveField(
            model_name='playlistitem',
            name='research',
        ),
        migrations.RemoveField(
            model_name='playlistitem',
            name='video',
        ),
        migrations.RemoveField(
            model_name='playlistitem',
            name='whitepaper',
        ),
        migrations.AlterField(
            model_name='playlistitem',
            name='lesson',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='learning.courselesson'),
        ),
        migrations.AlterField(
            model_name='playlistitem',
            name='module',
            field=models.ForeignKey(blank=True, help_text='The module the lesson sits in.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='items', to='learning.coursemodule'),
        ),
        migrations.AddConstraint(
            model_name='playlistitem',
            constraint=models.UniqueConstraint(fields=('playlist', 'lesson'), name='playlist_unique_lesson'),
        ),
    ]
