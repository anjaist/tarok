import pytest

from run import create_app


@pytest.fixture(scope='session', name='client')
def get_test_client():
    test_app = create_app()
    client = test_app.test_client()
    context = test_app.app_context()
    context.push()
    yield client
    context.pop()
