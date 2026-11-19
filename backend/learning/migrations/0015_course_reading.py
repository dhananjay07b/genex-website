import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """Further reading: published content shown after a course's lessons, not counted toward completion."""

    dependencies = [
        ('learning', '0014_quiz_questions'),
        ('pages', '0065_company_videos'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseReading',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position', models.PositiveIntegerField(default=0)),
            ],
            options={
                'verbose_name': 'further reading item',
                'ordering': ['position', 'id'],
            },
        ),
        migrations.AddField(
            model_name='coursereading',
            name='article',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='pages.techarticle'),
        ),
        migrations.AddField(
            model_name='coursereading',
            name='playlist',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reading', to='learning.playlist'),
        ),
        migrations.AddField(
            model_name='coursereading',
            name='podcast',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='pages.podcastepisode'),
        ),
        migrations.AddField(
            model_name='coursereading',
            name='post',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='pages.blogpost'),
        ),
        migrations.AddField(
            model_name='coursereading',
            name='research',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='pages.casestudy'),
        ),
        migrations.AddField(
            model_name='coursereading',
            name='video',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='pages.videoitem'),
        ),
        migrations.AddField(
            model_name='coursereading',
            name='whitepaper',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='pages.whitepaper'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.CheckConstraint(condition=models.Q(models.Q(('article__isnull', True), ('podcast__isnull', True), ('post__isnull', True), ('research__isnull', True), ('video__isnull', False), ('whitepaper__isnull', True)), models.Q(('article__isnull', True), ('podcast__isnull', True), ('post__isnull', False), ('research__isnull', True), ('video__isnull', True), ('whitepaper__isnull', True)), models.Q(('article__isnull', False), ('podcast__isnull', True), ('post__isnull', True), ('research__isnull', True), ('video__isnull', True), ('whitepaper__isnull', True)), models.Q(('article__isnull', True), ('podcast__isnull', True), ('post__isnull', True), ('research__isnull', False), ('video__isnull', True), ('whitepaper__isnull', True)), models.Q(('article__isnull', True), ('podcast__isnull', True), ('post__isnull', True), ('research__isnull', True), ('video__isnull', True), ('whitepaper__isnull', False)), models.Q(('article__isnull', True), ('podcast__isnull', False), ('post__isnull', True), ('research__isnull', True), ('video__isnull', True), ('whitepaper__isnull', True)), _connector='OR'), name='course_reading_exactly_one_target'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.UniqueConstraint(condition=models.Q(('video__isnull', False)), fields=('playlist', 'video'), name='course_reading_unique_video'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.UniqueConstraint(condition=models.Q(('post__isnull', False)), fields=('playlist', 'post'), name='course_reading_unique_post'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.UniqueConstraint(condition=models.Q(('article__isnull', False)), fields=('playlist', 'article'), name='course_reading_unique_article'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.UniqueConstraint(condition=models.Q(('research__isnull', False)), fields=('playlist', 'research'), name='course_reading_unique_research'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.UniqueConstraint(condition=models.Q(('whitepaper__isnull', False)), fields=('playlist', 'whitepaper'), name='course_reading_unique_whitepaper'),
        ),
        migrations.AddConstraint(
            model_name='coursereading',
            constraint=models.UniqueConstraint(condition=models.Q(('podcast__isnull', False)), fields=('playlist', 'podcast'), name='course_reading_unique_podcast'),
        ),
    ]
