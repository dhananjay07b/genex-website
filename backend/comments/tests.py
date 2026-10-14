from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from engagement.models import Notification
from pages.models import BlogPost

from .models import Comment


def make_user(username):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x")


class CommentApiTests(TestCase):
    """Members comment on blog posts, videos and podcast episodes, one reply level deep."""

    def setUp(self):
        cache.clear()  # comment-create rate limit
        self.post = BlogPost.objects.create(title="Grid notes", date="2026-10-01")
        self.other_post = BlogPost.objects.create(title="Inverter notes", date="2026-10-02")
        self.post_type = ContentType.objects.get_for_model(BlogPost)
        self.alice, self.bob = make_user("alice"), make_user("bob")
        self.api = APIClient()
        self.api.force_authenticate(self.alice)

    def _comment(self, author, post=None, parent=None, body="Useful."):
        post = post or self.post
        return Comment.objects.create(content_type=self.post_type, object_id=post.pk, author=author, parent=parent, body=body)

    def _post(self, **data):
        return self.api.post("/api/comments/", {"content_type": "blogpost", "object_id": self.post.pk, "body": "Agreed.", **data}, format="json")

    def test_list_is_one_items_visible_comments(self):
        shown = self._comment(self.bob)
        self._comment(self.bob, post=self.other_post)
        Comment.objects.create(content_type=self.post_type, object_id=self.post.pk, author=self.bob, body="Spam", status="hidden")
        res = APIClient().get(f"/api/comments/?content_type=blogpost&object_id={self.post.pk}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual([c["id"] for c in res.json()], [shown.pk])

    def test_list_needs_an_item(self):
        for query in ("", "?content_type=blogpost", f"?object_id={self.post.pk}",
                      "?content_type=blogpost&object_id=abc", f"?content_type=user&object_id={self.alice.pk}"):
            self.assertEqual(APIClient().get(f"/api/comments/{query}").status_code, 400, query)

    def test_comment_on_an_item(self):
        res = self._post()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Comment.objects.get().author, self.alice)

    def test_only_commentable_content(self):
        # "comment" names two installed models and used to crash; "user" was accepted.
        for model in ("comment", "user", "enquiry", "nonsense"):
            self.assertEqual(self._post(content_type=model).status_code, 400, model)
        self.assertFalse(Comment.objects.exists())

    def test_item_must_exist(self):
        res = self._post(object_id=999_999)
        self.assertEqual(res.status_code, 400)
        self.assertIn("object_id", res.json())

    def test_reply_notifies_the_parent_author(self):
        parent = self._comment(self.bob)
        self.assertEqual(self._post(parent=parent.pk).status_code, 201)
        self.assertTrue(Notification.objects.filter(recipient=self.bob, kind="comment_reply").exists())

    def test_reply_must_be_on_the_same_item_and_one_level_deep(self):
        elsewhere = self._comment(self.bob, post=self.other_post)
        top = self._comment(self.bob)
        reply = self._comment(self.bob, parent=top)
        hidden = Comment.objects.create(content_type=self.post_type, object_id=self.post.pk, author=self.bob, body="x", status="hidden")
        for parent in (elsewhere, reply, hidden):
            res = self._post(parent=parent.pk)
            self.assertEqual(res.status_code, 400, parent)
            self.assertIn("parent", res.json())

    def test_edit_changes_the_text_only(self):
        mine = self._comment(self.alice)
        res = self.api.patch(f"/api/comments/{mine.pk}/", {"body": "Edited.", "object_id": self.other_post.pk}, format="json")
        self.assertEqual(res.status_code, 200)
        mine.refresh_from_db()
        self.assertEqual((mine.body, mine.object_id), ("Edited.", self.post.pk))
        self.assertIsNotNone(mine.edited_at)

    def test_only_the_author_edits_or_deletes(self):
        theirs = self._comment(self.bob)
        self.assertEqual(self.api.patch(f"/api/comments/{theirs.pk}/", {"body": "Mine now"}, format="json").status_code, 403)
        self.assertEqual(self.api.delete(f"/api/comments/{theirs.pk}/").status_code, 403)
        self.assertEqual(APIClient().post("/api/comments/", {"content_type": "blogpost", "object_id": self.post.pk, "body": "Hi"}, format="json").status_code, 401)
