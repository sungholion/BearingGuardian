"""
Test suite for Database module
"""

import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.modules.database.connection import DatabaseManager, get_db
from app.modules.database.models import VibrationInput, VibrationResult, VibrationStats
from app.modules.database.repository import VibrationRepository
from app.config.database import DatabaseConfig


class TestDatabaseConfig:
    """DatabaseConfig 클래스 테스트"""
    
    def test_database_config_defaults(self):
        """기본 설정값 테스트"""
        config = DatabaseConfig()
        
        assert config.host == "localhost"
        assert config.port == 3306
        assert config.database == "bearing_db"
        assert config.username == "bearing"
        assert config.password == "bear1234!"
    
    def test_connection_string(self):
        """연결 문자열 생성 테스트"""
        config = DatabaseConfig()
        connection_string = config.connection_string
        
        assert "mysql+pymysql://" in connection_string
        assert "bearing:bear1234!" in connection_string
        assert "localhost:3306" in connection_string
        assert "bearing_db" in connection_string
    
    def test_get_connection_string_sync(self):
        """동기 연결 문자열 테스트"""
        config = DatabaseConfig()
        sync_string = config.get_connection_string(async_mode=False)
        
        assert "mysql+pymysql://" in sync_string
        assert "mysql+aiomysql://" not in sync_string
    
    def test_get_connection_string_async(self):
        """비동기 연결 문자열 테스트"""
        config = DatabaseConfig()
        async_string = config.get_connection_string(async_mode=True)
        
        assert "mysql+aiomysql://" in async_string


class TestDatabaseModels:
    """Database Models 테스트"""
    
    def test_vibration_input_model(self):
        """VibrationInput 모델 테스트"""
        input_data = VibrationInput(
            mean=1.0,
            stddev=2.0,
            rms=3.0,
            max=4.0,
            min=5.0,
            ptp=6.0,
            skewness=7.0,
            kurtosis=8.0,
            crest_factor=9.0,
            freq_mean=10.0,
            freq_stddev=11.0,
            freq_centroid=12.0,
            freq_bandwidth=13.0
        )
        
        assert input_data.mean == 1.0
        assert input_data.freq_bandwidth == 13.0
        assert input_data.__tablename__ == "vibration_input"
    
    def test_vibration_input_to_dict(self):
        """VibrationInput to_dict 메서드 테스트"""
        input_data = VibrationInput(
            mean=1.0,
            stddev=2.0,
            rms=3.0,
            max=4.0,
            min=5.0,
            ptp=6.0,
            skewness=7.0,
            kurtosis=8.0,
            crest_factor=9.0,
            freq_mean=10.0,
            freq_stddev=11.0,
            freq_centroid=12.0,
            freq_bandwidth=13.0
        )
        
        result = input_data.to_dict()
        
        assert isinstance(result, dict)
        assert result["mean"] == 1.0
        assert result["freq_bandwidth"] == 13.0
        assert "id" in result
    
    def test_vibration_result_model(self):
        """VibrationResult 모델 테스트"""
        result_data = VibrationResult(
            input_id=1,
            predicted_fault="ball_fault"
        )
        
        assert result_data.input_id == 1
        assert result_data.predicted_fault == "ball_fault"
        assert result_data.__tablename__ == "vibration_result"
    
    def test_vibration_result_to_dict(self):
        """VibrationResult to_dict 메서드 테스트"""
        result_data = VibrationResult(
            input_id=1,
            predicted_fault="ball_fault"
        )
        
        result = result_data.to_dict()
        
        assert isinstance(result, dict)
        assert result["input_id"] == 1
        assert result["predicted_fault"] == "ball_fault"
        assert "id" in result
    
    def test_vibration_stats_model(self):
        """VibrationStats 모델 테스트"""
        stats_data = VibrationStats(
            total_count=100,
            normal_count=50,
            fault_count=50,
            ball_fault_count=20,
            ir_fault_count=15,
            or_fault_count=15
        )
        
        assert stats_data.total_count == 100
        assert stats_data.normal_count == 50
        assert stats_data.__tablename__ == "vibration_stats"


class TestDatabaseConnection:
    """Database Connection 테스트"""
    
    @patch('app.modules.database.connection.create_engine')
    def test_database_manager_init(self, mock_create_engine):
        """DatabaseManager 초기화 테스트"""
        mock_engine = Mock()
        mock_create_engine.return_value = mock_engine
        
        manager = DatabaseManager()
        
        assert manager.engine is not None
        assert manager.SessionLocal is not None
        mock_create_engine.assert_called_once()
    
    @patch('app.modules.database.connection.create_engine')
    def test_database_manager_get_session(self, mock_create_engine):
        """세션 생성 테스트"""
        mock_engine = Mock()
        mock_session_maker = Mock()
        mock_session = Mock()
        mock_session_maker.return_value = mock_session
        mock_create_engine.return_value = mock_engine
        
        manager = DatabaseManager()
        manager.SessionLocal = mock_session_maker
        
        session = manager.get_session()
        
        assert session is not None
        mock_session_maker.assert_called_once()
    
    @patch('app.modules.database.connection.create_engine')
    def test_database_manager_test_connection_success(self, mock_create_engine):
        """연결 테스트 성공 케이스"""
        mock_engine = Mock()
        mock_connection = Mock()
        mock_context = Mock()
        mock_context.__enter__ = Mock(return_value=mock_connection)
        mock_context.__exit__ = Mock(return_value=None)
        mock_engine.connect.return_value = mock_context
        mock_create_engine.return_value = mock_engine
        
        manager = DatabaseManager()
        manager.engine = mock_engine
        
        result = manager.test_connection()
        
        assert result is True
        mock_connection.execute.assert_called_once_with("SELECT 1")
    
    @patch('app.modules.database.connection.create_engine')
    def test_database_manager_test_connection_failure(self, mock_create_engine):
        """연결 테스트 실패 케이스"""
        mock_engine = Mock()
        mock_engine.connect.side_effect = Exception("Connection failed")
        mock_create_engine.return_value = mock_engine
        
        manager = DatabaseManager()
        manager.engine = mock_engine
        
        result = manager.test_connection()
        
        assert result is False


class TestVibrationRepository:
    """VibrationRepository 테스트"""
    
    @pytest.fixture
    def mock_db_session(self):
        """Mock DB 세션 생성"""
        return Mock()
    
    @pytest.fixture
    def repository(self, mock_db_session):
        """Repository 인스턴스 생성"""
        return VibrationRepository(mock_db_session)
    
    def test_save_prediction_success(self, repository, mock_db_session):
        """예측 결과 저장 성공 테스트"""
        # Mock 데이터
        features = {
            "mean": 1.0, "stddev": 2.0, "rms": 3.0, "max": 4.0, "min": 5.0,
            "ptp": 6.0, "skewness": 7.0, "kurtosis": 8.0, "crest_factor": 9.0,
            "freq_mean": 10.0, "freq_stddev": 11.0, "freq_centroid": 12.0, "freq_bandwidth": 13.0
        }
        prediction_result = {"predicted_label": "ball_fault"}
        
        # Mock 설정 - 실제 객체 생성
        mock_input = VibrationInput(
            mean=1.0, stddev=2.0, rms=3.0, max=4.0, min=5.0,
            ptp=6.0, skewness=7.0, kurtosis=8.0, crest_factor=9.0,
            freq_mean=10.0, freq_stddev=11.0, freq_centroid=12.0, freq_bandwidth=13.0
        )
        mock_input.id = 1
        
        mock_result = VibrationResult(input_id=1, predicted_fault="ball_fault")
        mock_result.id = 1
        mock_result.predicted_time = None
        
        # Mock 메서드 설정 - add 호출 시 객체에 ID 설정
        def mock_add(obj):
            if isinstance(obj, VibrationInput):
                obj.id = 1
            elif isinstance(obj, VibrationResult):
                obj.id = 1
            return None
        
        mock_db_session.add.side_effect = mock_add
        mock_db_session.flush.return_value = None
        mock_db_session.commit.return_value = None
        
        # 실행
        result = repository.save_prediction(features, prediction_result)
        
        # 검증
        assert result["input_id"] == 1
        assert result["result_id"] == 1
        assert result["predicted_fault"] == "ball_fault"
        assert mock_db_session.add.call_count == 2  # input과 result 각각
        mock_db_session.commit.assert_called_once()
    
    def test_save_prediction_failure(self, repository, mock_db_session):
        """예측 결과 저장 실패 테스트"""
        features = {"mean": 1.0}
        prediction_result = {"predicted_label": "ball_fault"}
        
        # Mock 설정 - 예외 발생
        mock_db_session.add.side_effect = Exception("Database error")
        mock_db_session.rollback.return_value = None
        
        # 실행 및 검증
        with pytest.raises(Exception, match="Database error"):
            repository.save_prediction(features, prediction_result)
        
        mock_db_session.rollback.assert_called_once()
    
    def test_get_recent_predictions(self, repository, mock_db_session):
        """최근 예측 결과 조회 테스트"""
        # Mock 설정
        mock_input = Mock()
        mock_input.to_dict.return_value = {"mean": 1.0}
        
        mock_result = Mock()
        mock_result.id = 1
        mock_result.predicted_fault = "ball_fault"
        mock_result.predicted_time = None
        
        mock_query = Mock()
        mock_query.join.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [(mock_input, mock_result)]
        
        mock_db_session.query.return_value = mock_query
        
        # 실행
        result = repository.get_recent_predictions(limit=5)
        
        # 검증
        assert len(result) == 1
        assert result[0]["id"] == 1
        assert result[0]["predicted_fault"] == "ball_fault"
        assert result[0]["features"] == {"mean": 1.0}
    
    def test_get_prediction_stats(self, repository, mock_db_session):
        """예측 통계 조회 테스트"""
        # Mock 설정
        mock_count_query = Mock()
        mock_count_query.count.return_value = 10
        
        mock_stats_query = Mock()
        mock_stats_query.group_by.return_value = mock_stats_query
        mock_stats_query.all.return_value = [("ball_fault", 5), ("normal", 5)]
        
        mock_db_session.query.side_effect = [mock_count_query, mock_stats_query]
        
        # 실행
        result = repository.get_prediction_stats()
        
        # 검증
        assert result["total_predictions"] == 10
        assert result["fault_type_counts"]["ball_fault"] == 5
        assert result["fault_type_counts"]["normal"] == 5


if __name__ == "__main__":
    pytest.main([__file__]) 