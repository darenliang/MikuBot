import unittest
from tests import tester

suite = unittest.TestLoader().loadTestsFromModule(tester)
unittest.TextTestRunner(verbosity=2).run(suite)
