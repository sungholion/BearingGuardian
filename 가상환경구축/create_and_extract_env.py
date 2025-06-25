import subprocess
import os
import sys

def run_command(command, check_error=True):
    """명령어를 실행하고 결과를 출력하며, 오류 발생 시 종료합니다."""
    print(f"\n실행 중: {command}")
    try:
        process = subprocess.run(command, shell=True, check=check_error, capture_output=True, text=True, encoding='utf-8')
        if process.stdout:
            print(process.stdout)
        if process.stderr and check_error:
            print(f"오류 출력:\n{process.stderr}")
        return process
    except subprocess.CalledProcessError as e:
        print(f"오류 발생: {e}")
        print(f"Stderr: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"오류: '{command.split()[0]}' 명령을 찾을 수 없습니다. conda가 PATH에 설정되어 있는지 확인해주세요.")
        sys.exit(1)

def main():
    env_name = "br3"
    yaml_file = "environment.yaml"
    python_version_output = f"{env_name}_python_version.txt"
    requirements_output = f"{env_name}_requirements.txt"

    print("=" * 50)
    print(f"콘다 환경 '{env_name}' 설정 및 정보 추출 시작")
    print("=" * 50)

    # 1. conda가 설치되어 있는지 확인 (선택 사항이지만 유용)
    try:
        run_command("conda --version", check_error=True)
    except SystemExit:
        print("conda 명령어를 찾을 수 없습니다. Miniconda/Anaconda가 설치되어 있고 PATH에 추가되었는지 확인해주세요.")
        input("계속하려면 Enter를 누르세요...")
        sys.exit(1)

    # 2. 가상 환경 존재 여부 확인
    print(f"\n콘다 환경 '{env_name}' 존재 여부 확인 중...")
    result = run_command(f"conda env list | findstr /b /c:\"{env_name}\"", check_error=False)

    if result.returncode != 0: # 환경이 존재하지 않음
        print(f"콘다 환경 '{env_name}'이(가) 존재하지 않습니다. '{yaml_file}'을(를) 사용하여 생성합니다...")
        if not os.path.exists(yaml_file):
            print(f"오류: '{yaml_file}' 파일을 찾을 수 없습니다. 스크립트와 같은 디렉토리에 있는지 확인해주세요.")
            input("계속하려면 Enter를 누르세요...")
            sys.exit(1)
        run_command(f"conda env create -f {yaml_file}")
        print(f"콘다 환경 '{env_name}'이(가) 성공적으로 생성되었습니다.")
    else:
        print(f"콘다 환경 '{env_name}'이(가) 이미 존재합니다.")

    # 3. 가상 환경 활성화 및 정보 추출
    # 콘다 환경을 직접 activate 하지 않고, 각 명령을 해당 환경에서 실행하도록 합니다.
    # Windows에서는 `conda run -n env_name`을 사용합니다.
    # Linux/macOS에서는 `conda activate env_name && command` 또는 `conda run -n env_name` 사용.
    # 여기서는 범용성을 위해 `conda run`을 사용합니다.

    print(f"\n콘다 환경 '{env_name}'에서 파이썬 버전 추출 중...")
    with open(python_version_output, "w", encoding='utf-8') as f:
        process = run_command(f"conda run -n {env_name} python --version", check_error=True)
        f.write(process.stdout.strip() + "\n")
    print(f"파이썬 버전 정보가 '{python_version_output}' 파일에 저장되었습니다.")

    print(f"\n콘다 환경 '{env_name}'에서 pip 라이브러리 목록 추출 중...")
    with open(requirements_output, "w", encoding='utf-8') as f:
        process = run_command(f"conda run -n {env_name} pip freeze", check_error=True)
        f.write(process.stdout)
    print(f"pip 라이브러리 목록이 '{requirements_output}' 파일에 저장되었습니다.")

    print("\n" + "=" * 50)
    print("모든 작업 완료!")
    print("=" * 50)
    input("계속하려면 Enter를 누르세요...") # 사용자가 결과를 확인하도록 대기

if __name__ == "__main__":
    main()
