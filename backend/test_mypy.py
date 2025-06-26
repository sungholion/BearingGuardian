# mypy 테스트 파일

def add_numbers(a: int, b: int) -> int:
    """두 숫자를 더하는 함수"""
    return a + b

def get_user_name() -> str:
    """사용자 이름을 반환하는 함수"""
    return "John Doe"

def process_data(data: list[int]) -> dict[str, int]:
    """데이터를 처리하는 함수"""
    return {"count": len(data), "sum": sum(data)}

# 타입 힌트가 없는 함수 (mypy가 경고할 수 있음)
def old_style_function(a, b):
    return a + b

# 잘못된 타입 사용 (mypy가 오류를 찾을 수 있음)
def wrong_type_function() -> str:
    return 123  # int를 반환하는데 str 타입 힌트가 있음

# 올바른 사용
result1 = add_numbers(5, 3)  # OK
result2 = get_user_name()    # OK
result3 = process_data([1, 2, 3])  # OK

# 잘못된 사용 (mypy가 경고할 수 있음)
# result4 = add_numbers("5", "3")  # str을 int에 전달
# result5 = old_style_function("a", "b")  # 타입 힌트 없음 