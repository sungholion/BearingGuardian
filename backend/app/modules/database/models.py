"""
Database Models Module

This module defines SQLAlchemy ORM models for the bearing fault prediction system.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sql_func

from .connection import Base


class VibrationRaw(Base):
    """원시 진동 데이터 테이블"""
    __tablename__ = "vibration_raw"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    max = Column(Float)
    min = Column(Float)
    mean = Column(Float)
    sd = Column(Float)
    rms = Column(Float)
    skewness = Column(Float)
    kurtosis = Column(Float)
    crest = Column(Float)
    form = Column(Float)
    fault = Column(String(50))


class VibrationPreprocessed(Base):
    """전처리된 진동 데이터 테이블"""
    __tablename__ = "vibration_preprocessed"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    mean = Column(Float)
    stddev = Column(Float)
    rms = Column(Float)
    max = Column(Float)
    min = Column(Float)
    ptp = Column(Float)
    skewness = Column(Float)
    kurtosis = Column(Float)
    crest_factor = Column(Float)
    freq_mean = Column(Float)
    freq_stddev = Column(Float)
    freq_centroid = Column(Float)
    freq_bandwidth = Column(Float)
    label = Column(String(50))


class VibrationInput(Base):
    """예측 입력 데이터 테이블"""
    __tablename__ = "vibration_input"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    mean = Column(Float)
    stddev = Column(Float)
    rms = Column(Float)
    max = Column(Float)
    min = Column(Float)
    ptp = Column(Float)
    skewness = Column(Float)
    kurtosis = Column(Float)
    crest_factor = Column(Float)
    freq_mean = Column(Float)
    freq_stddev = Column(Float)
    freq_centroid = Column(Float)
    freq_bandwidth = Column(Float)
    
    # 관계 설정 (1:1)
    result = relationship("VibrationResult", back_populates="input_data", uselist=False)
    
    def to_dict(self) -> dict:
        """모델을 딕셔너리로 변환"""
        return {
            "id": self.id,
            "mean": self.mean,
            "stddev": self.stddev,
            "rms": self.rms,
            "max": self.max,
            "min": self.min,
            "ptp": self.ptp,
            "skewness": self.skewness,
            "kurtosis": self.kurtosis,
            "crest_factor": self.crest_factor,
            "freq_mean": self.freq_mean,
            "freq_stddev": self.freq_stddev,
            "freq_centroid": self.freq_centroid,
            "freq_bandwidth": self.freq_bandwidth
        }


class VibrationResult(Base):
    """예측 결과 테이블"""
    __tablename__ = "vibration_result"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    input_id = Column(Integer, ForeignKey("vibration_input.id", ondelete="CASCADE"), nullable=False)
    predicted_fault = Column(String(50))
    predicted_time = Column(DateTime, server_default=sql_func.now())
    
    # 관계 설정 (1:1)
    input_data = relationship("VibrationInput", back_populates="result")
    
    def to_dict(self) -> dict:
        """모델을 딕셔너리로 변환"""
        return {
            "id": self.id,
            "input_id": self.input_id,
            "predicted_fault": self.predicted_fault,
            "predicted_time": self.predicted_time.isoformat() if self.predicted_time else None
        }


class VibrationStats(Base):
    """진동 데이터 통계 테이블"""
    __tablename__ = "vibration_stats"
    
    stat_time = Column(DateTime, primary_key=True, server_default=sql_func.now())
    total_count = Column(Integer)
    normal_count = Column(Integer)
    fault_count = Column(Integer)
    ball_fault_count = Column(Integer)
    ir_fault_count = Column(Integer)
    or_fault_count = Column(Integer)
    
    def to_dict(self) -> dict:
        """모델을 딕셔너리로 변환"""
        return {
            "stat_time": self.stat_time.isoformat() if self.stat_time else None,
            "total_count": self.total_count,
            "normal_count": self.normal_count,
            "fault_count": self.fault_count,
            "ball_fault_count": self.ball_fault_count,
            "ir_fault_count": self.ir_fault_count,
            "or_fault_count": self.or_fault_count
        } 