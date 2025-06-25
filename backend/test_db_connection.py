"""
Database Connection Test Script

This script tests the database connection and inserts dummy data into vibration_stats table.
"""

import sys
import os
from datetime import datetime

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.modules.database.connection import get_db_manager
from app.modules.database.models import VibrationStats


def test_database_connection():
    """데이터베이스 연결 테스트"""
    print("=== 데이터베이스 연결 테스트 ===")
    
    try:
        # DB 매니저 가져오기
        db_manager = get_db_manager()
        
        # 연결 테스트
        if db_manager.test_connection():
            print("✅ 데이터베이스 연결 성공!")
        else:
            print("❌ 데이터베이스 연결 실패!")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ 데이터베이스 연결 오류: {e}")
        return False


def insert_dummy_stats_data():
    """vibration_stats 테이블에 더미 데이터 삽입"""
    print("\n=== vibration_stats 더미 데이터 삽입 ===")
    
    try:
        # DB 매니저 가져오기
        db_manager = get_db_manager()
        session = db_manager.get_session()
        
        # 더미 데이터 생성 (stat_time 명시적 설정)
        current_time = datetime.now()
        dummy_stats = VibrationStats(
            stat_time=current_time,
            total_count=100,
            normal_count=60,
            fault_count=40,
            ball_fault_count=15,
            ir_fault_count=12,
            or_fault_count=13
        )
        
        # 데이터베이스에 삽입
        session.add(dummy_stats)
        session.commit()
        
        print("✅ 더미 데이터 삽입 성공!")
        print(f"   - 삽입된 데이터: {dummy_stats.to_dict()}")
        
        # 삽입된 데이터 확인 (새로운 세션으로 조회)
        session.close()
        session = db_manager.get_session()
        inserted_stats = session.query(VibrationStats).filter(
            VibrationStats.stat_time == current_time
        ).first()
        
        if inserted_stats:
            print("✅ 데이터베이스에서 삽입된 데이터 확인 완료!")
            print(f"   - 확인된 데이터: {inserted_stats.to_dict()}")
        else:
            print("❌ 데이터베이스에서 삽입된 데이터를 찾을 수 없습니다.")
        
        session.close()
        return True
        
    except Exception as e:
        print(f"❌ 더미 데이터 삽입 오류: {e}")
        if 'session' in locals():
            session.rollback()
            session.close()
        return False


def check_existing_stats():
    """기존 vibration_stats 데이터 확인"""
    print("\n=== 기존 vibration_stats 데이터 확인 ===")
    
    try:
        # DB 매니저 가져오기
        db_manager = get_db_manager()
        session = db_manager.get_session()
        
        # 전체 데이터 개수 확인
        total_count = session.query(VibrationStats).count()
        print(f"총 vibration_stats 레코드 수: {total_count}")
        
        if total_count > 0:
            # 최근 5개 데이터 조회
            recent_stats = session.query(VibrationStats).order_by(
                VibrationStats.stat_time.desc()
            ).limit(5).all()
            
            print("\n최근 5개 데이터:")
            for i, stats in enumerate(recent_stats, 1):
                print(f"  {i}. {stats.to_dict()}")
        
        session.close()
        return True
        
    except Exception as e:
        print(f"❌ 데이터 확인 오류: {e}")
        if 'session' in locals():
            session.close()
        return False


def main():
    """메인 함수"""
    print("BearingGuardian 데이터베이스 연결 테스트")
    print("=" * 50)
    
    # 1. 데이터베이스 연결 테스트
    if not test_database_connection():
        print("\n❌ 데이터베이스 연결에 실패했습니다. 설정을 확인해주세요.")
        return
    
    # 2. 기존 데이터 확인
    check_existing_stats()
    
    # 3. 더미 데이터 삽입
    if insert_dummy_stats_data():
        print("\n✅ 모든 테스트가 성공적으로 완료되었습니다!")
        print("MySQL Workbench에서 vibration_stats 테이블을 확인해보세요.")
    else:
        print("\n❌ 더미 데이터 삽입에 실패했습니다.")


if __name__ == "__main__":
    main() 