"""
Database Repository Module

This module provides CRUD operations for vibration data and prediction results.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
import logging

from .models import VibrationInput, VibrationResult, VibrationStats
from .connection import get_db_manager

logger = logging.getLogger(__name__)


class VibrationRepository:
    """진동 데이터 저장소 클래스"""
    
    def __init__(self, db: Session):
        """
        저장소 초기화
        
        Args:
            db: 데이터베이스 세션
        """
        self.db = db
    
    def save_prediction(self, features: Dict[str, float], prediction_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        예측 결과를 데이터베이스에 저장
        
        Args:
            features: 추출된 피처 딕셔너리
            prediction_result: 예측 결과 딕셔너리
            
        Returns:
            Dict[str, Any]: 저장된 결과 정보
        """
        try:
            # 1. 입력 피처 저장
            input_data = VibrationInput(
                mean=features.get("mean"),
                stddev=features.get("stddev"),
                rms=features.get("rms"),
                max=features.get("max"),
                min=features.get("min"),
                ptp=features.get("ptp"),
                skewness=features.get("skewness"),
                kurtosis=features.get("kurtosis"),
                crest_factor=features.get("crest_factor"),
                freq_mean=features.get("freq_mean"),
                freq_stddev=features.get("freq_stddev"),
                freq_centroid=features.get("freq_centroid"),
                freq_bandwidth=features.get("freq_bandwidth")
            )
            
            self.db.add(input_data)
            self.db.flush()  # ID 생성을 위해 flush
            
            # 2. 예측 결과 저장
            result_data = VibrationResult(
                input_id=input_data.id,
                predicted_fault=prediction_result.get("predicted_label")
            )
            
            self.db.add(result_data)
            self.db.commit()
            
            logger.info(f"예측 결과 저장 완료: ID={input_data.id}, 예측={prediction_result.get('predicted_label')}")
            
            return {
                "input_id": input_data.id,
                "result_id": result_data.id,
                "predicted_fault": result_data.predicted_fault,
                "predicted_time": result_data.predicted_time
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"예측 결과 저장 실패: {e}")
            raise
    
    def get_recent_predictions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        최근 예측 결과 조회
        
        Args:
            limit: 조회할 개수
            
        Returns:
            List[Dict[str, Any]]: 최근 예측 결과 리스트
        """
        try:
            results = (
                self.db.query(VibrationInput, VibrationResult)
                .join(VibrationResult, VibrationResult.input_id == VibrationInput.id)
                .order_by(desc(VibrationResult.predicted_time))
                .limit(limit)
                .all()
            )
            
            prediction_history = []
            for input_data, result_data in results:
                history_item = {
                    "id": result_data.id,
                    "predicted_fault": result_data.predicted_fault,
                    "predicted_time": result_data.predicted_time.isoformat() if result_data.predicted_time else None,
                    "features": input_data.to_dict()
                }
                prediction_history.append(history_item)
            
            logger.info(f"최근 예측 결과 조회 완료: {len(prediction_history)}개")
            return prediction_history
            
        except Exception as e:
            logger.error(f"최근 예측 결과 조회 실패: {e}")
            raise
    
    def get_prediction_by_id(self, prediction_id: int) -> Optional[Dict[str, Any]]:
        """
        ID로 예측 결과 조회
        
        Args:
            prediction_id: 예측 결과 ID
            
        Returns:
            Optional[Dict[str, Any]]: 예측 결과 정보
        """
        try:
            result = (
                self.db.query(VibrationInput, VibrationResult)
                .join(VibrationResult, VibrationResult.input_id == VibrationInput.id)
                .filter(VibrationResult.id == prediction_id)
                .first()
            )
            
            if result:
                input_data, result_data = result
                return {
                    "id": result_data.id,
                    "predicted_fault": result_data.predicted_fault,
                    "predicted_time": result_data.predicted_time.isoformat() if result_data.predicted_time else None,
                    "features": input_data.to_dict()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"예측 결과 조회 실패: {e}")
            raise
    
    def get_prediction_stats(self) -> Dict[str, Any]:
        """
        예측 통계 정보 조회
        
        Returns:
            Dict[str, Any]: 통계 정보
        """
        try:
            # 전체 예측 수
            total_count = self.db.query(VibrationResult).count()
            
            # 고장 유형별 예측 수
            fault_counts = (
                self.db.query(
                    VibrationResult.predicted_fault,
                    func.count(VibrationResult.id).label('count')
                )
                .group_by(VibrationResult.predicted_fault)
                .all()
            )
            
            # 통계 딕셔너리 생성
            stats = {
                "total_predictions": total_count,
                "fault_type_counts": {}
            }
            
            for fault_type, count in fault_counts:
                stats["fault_type_counts"][fault_type] = count
            
            logger.info(f"예측 통계 조회 완료: 총 {total_count}개")
            return stats
            
        except Exception as e:
            logger.error(f"예측 통계 조회 실패: {e}")
            raise
    
    def delete_prediction(self, prediction_id: int) -> bool:
        """
        예측 결과 삭제
        
        Args:
            prediction_id: 예측 결과 ID
            
        Returns:
            bool: 삭제 성공 여부
        """
        try:
            result = self.db.query(VibrationResult).filter(VibrationResult.id == prediction_id).first()
            
            if result:
                self.db.delete(result)
                self.db.commit()
                logger.info(f"예측 결과 삭제 완료: ID={prediction_id}")
                return True
            else:
                logger.warning(f"삭제할 예측 결과를 찾을 수 없음: ID={prediction_id}")
                return False
                
        except Exception as e:
            self.db.rollback()
            logger.error(f"예측 결과 삭제 실패: {e}")
            raise
    
    def get_predictions_by_fault_type(self, fault_type: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        특정 고장 유형의 예측 결과 조회
        
        Args:
            fault_type: 고장 유형
            limit: 조회할 개수
            
        Returns:
            List[Dict[str, Any]]: 예측 결과 리스트
        """
        try:
            results = (
                self.db.query(VibrationInput, VibrationResult)
                .join(VibrationResult, VibrationResult.input_id == VibrationInput.id)
                .filter(VibrationResult.predicted_fault == fault_type)
                .order_by(desc(VibrationResult.predicted_time))
                .limit(limit)
                .all()
            )
            
            prediction_list = []
            for input_data, result_data in results:
                prediction_item = {
                    "id": result_data.id,
                    "predicted_fault": result_data.predicted_fault,
                    "predicted_time": result_data.predicted_time.isoformat() if result_data.predicted_time else None,
                    "features": input_data.to_dict()
                }
                prediction_list.append(prediction_item)
            
            logger.info(f"고장 유형별 예측 결과 조회 완료: {fault_type} - {len(prediction_list)}개")
            return prediction_list
            
        except Exception as e:
            logger.error(f"고장 유형별 예측 결과 조회 실패: {e}")
            raise 