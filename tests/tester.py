"""This test file contains tests for various apis"""

from unittest import TestCase

from tests import apis


class TestAPIs(TestCase):
    def test_get_trivia_response(self):
        self.assertEqual(apis.get_trivia_response(), 0)

    def test_get_theme_response(self):
        self.assertEqual(apis.get_theme_response(), 200)

    def test_get_overwatch_response(self):
        self.assertEqual(apis.get_overwatch_response(), 0)

    def test_get_sketchify_response(self):
        self.assertIsInstance(apis.get_sketchify_response(), str)

    def test_get_wolframalpha_response(self):
        self.assertEqual(apis.get_wolframalpha_response(), "2")

    def test_get_bitly_response(self):
        self.assertIsInstance(apis.get_bitly_response(), str)

    def test_get_translate_response(self):
        self.assertEqual(apis.get_translate_response(), 'Hi.')

    def test_get_clarifai_response(self):
        self.assertIsInstance(apis.get_clarifai_response(), str)

    def test_get_reddit_response(self):
        self.assertIsInstance(apis.get_reddit_response(), str)

    def test_get_booru_response(self):
        self.assertIsInstance(apis.get_booru_response(), str)

    def test_get_youtube_response(self):
        self.assertIsInstance(apis.get_youtube_response(), list)

    def test_get_anime_response(self):
        self.assertEqual(apis.get_anime_response(), "Cowboy Bebop")

    def test_get_fortnite_response(self):
        self.assertEqual(apis.get_fortnite_response(), True)

    def test_get_clashroyale_response(self):
        self.assertIsInstance(apis.get_clashroyale_response(), str)

    def test_get_dbl_response(self):
        self.assertEqual(apis.get_dbl_response(), 'world')

    def test_get_discord_response(self):
        self.assertEqual(apis.get_discord_response(), True)

    def test_get_cloc_response(self):
        self.assertIsInstance(apis.get_cloc_response()[0]['language'], str)
