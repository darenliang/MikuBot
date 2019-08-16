"""This test file contains tests for various apis"""

from unittest import TestCase
from tests import apis


class Test_APIs(TestCase):
    def test_get_trivia_response(self):
        self.assertEqual(apis.get_trivia_response(), 0)

    def test_get_theme_response(self):
        self.assertEqual(apis.get_theme_response(), 200)

    def test_get_overwatch_response(self):
        self.assertEqual(apis.get_overwatch_response(), 0)