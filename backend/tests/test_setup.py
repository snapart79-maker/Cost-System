"""Test 1.1: 기본 import 테스트.

TDD RED Phase: 이 테스트는 처음에 실패해야 합니다.
패키지가 제대로 설치되면 통과합니다.
"""



def test_backend_package_import():
    """backend 패키지를 import할 수 있어야 한다."""
    import backend

    assert backend is not None


def test_config_import():
    """config 모듈을 import할 수 있어야 한다."""
    from backend.config import settings

    assert settings is not None


def test_domain_entities_import():
    """domain.entities 모듈을 import할 수 있어야 한다."""
    from backend.domain import entities

    assert entities is not None


def test_infrastructure_persistence_import():
    """infrastructure.persistence 모듈을 import할 수 있어야 한다."""
    from backend.infrastructure.persistence import database

    assert database is not None
