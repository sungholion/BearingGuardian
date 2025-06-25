# 콘다 가상 환경 (`br3`) 설정 및 정보 추출 안내

이 문서는 `br3`이라는 이름의 콘다 가상 환경을 설정하고, 해당 환경의 파이썬 버전 및 설치된 라이브러리 목록을 추출하는 방법을 안내합니다.

**필수 준비물:**

1.  **Miniconda 또는 Anaconda 설치:** 시스템에 Miniconda 또는 Anaconda가 설치되어 있어야 합니다. 설치되어 있지 않다면, [Miniconda 다운로드 페이지](https://docs.conda.io/en/latest/miniconda.html) 또는 [Anaconda 다운로드 페이지](https://www.anaconda.com/products/distribution)에서 설치 파일을 다운로드하여 설치를 완료하십시오.
2.  **`environment.yaml` 파일:** 이 안내 문서와 함께 제공된 `environment.yaml` 파일이 있어야 합니다. 이 파일은 `br3` 환경을 구성하는 데 필요한 모든 패키지 정보를 담고 있습니다.

---

## 단계별 안내:

1.  ### 명령 프롬프트(Anaconda Prompt) 열기

    * Windows 시작 버튼을 클릭하고 검색창에 `Anaconda Prompt` 또는 `Miniconda Prompt`라고 입력합니다.
    * 검색 결과에 나타나는 `Anaconda Prompt (Miniconda3)` 또는 유사한 이름의 앱을 클릭하여 실행합니다.
        * **참고:** 일반 `명령 프롬프트(CMD)`가 아닌, `Anaconda Prompt`를 사용해야 `conda` 명령어를 정상적으로 사용할 수 있습니다.

2.  ### `environment.yaml` 파일이 있는 디렉터리로 이동

    * Anaconda Prompt가 열리면, `environment.yaml` 파일이 저장된 폴더 경로로 이동해야 합니다.
    * 예를 들어, `environment.yaml` 파일이 바탕화면의 `프로젝트`라는 폴더 안에 있다면:
        ```bash
        cd C:\Users\YourUsername\Desktop\프로젝트
        ```
        (`YourUsername` 대신 본인의 실제 Windows 사용자 이름을 입력하십시오.)
    * 파일이 있는 정확한 경로를 모른다면, 파일 탐색기에서 `environment.yaml` 파일을 찾아 해당 폴더로 이동한 후, 상단의 주소 표시줄을 클릭하여 경로를 복사하여 `cd` 명령어 뒤에 붙여넣으면 됩니다.

3.  ### 콘다 가상 환경 (`br3`) 생성

    * `environment.yaml` 파일에 정의된 대로 `br3` 가상 환경을 생성합니다. 이 과정은 시간이 다소 소요될 수 있습니다.
    * **명령어:**
        ```bash
        conda env create -f environment.yaml
        ```
    * **참고:** 만약 `br3` 환경이 이미 존재한다면, "Conda environment 'br3' already exists"와 같은 메시지가 나올 수 있습니다. 이 경우 다음 단계로 진행하시면 됩니다.

4.  ### 콘다 가상 환경 (`br3`) 활성화

    * 생성된 `br3` 환경을 활성화합니다. 활성화되면 명령 프롬프트 앞에 `(br3)`이라는 표시가 나타납니다.
    * **명령어:**
        ```bash
        conda activate br3
        ```

5.  ### 파이썬 버전 추출

    * 현재 활성화된 `br3` 환경의 파이썬 버전을 확인하고 `br3_python_version.txt` 파일로 저장합니다.
    * **명령어:**
        ```bash
        python --version > br3_python_version.txt
        ```
    * `br3_python_version.txt` 파일은 현재 디렉터리에 생성됩니다.

6.  ### 라이브러리 목록 추출 (`pip freeze`)

    * `br3` 환경에 설치된 모든 파이썬 라이브러리 목록을 `br3_requirements.txt` 파일로 저장합니다. 이 파일은 다른 환경에서 동일한 라이브러리를 설치하는 데 사용할 수 있습니다.
    * **명령어:**
        ```bash
        pip freeze > br3_requirements.txt
        ```
    * `br3_requirements.txt` 파일도 현재 디렉터리에 생성됩니다.

7.  ### 콘다 가상 환경 비활성화

    * 작업을 마친 후에는 `br3` 환경을 비활성화하여 기본 환경으로 돌아갑니다.
    * **명령어:**
        ```bash
        conda deactivate
        ```
    * 명령 프롬프트 앞에 `(base)` 또는 아무것도 표시되지 않으면 비활성화된 것입니다.

---

### 작업 완료!

이제 `br3` 가상 환경의 파이썬 버전 정보 (`br3_python_version.txt`)와 설치된 라이브러리 목록 (`br3_requirements.txt`) 파일이 현재 디렉터리에 생성되었습니다.

**문제 발생 시:**

* 어떤 단계에서 오류 메시지가 나타나면, 해당 메시지를 정확히 복사하여 알려주시면 문제 해결에 도움을 드릴 수 있습니다.
* `conda` 명령어를 찾을 수 없다는 오류가 계속 발생하면, Anaconda Prompt를 제대로 실행했는지 다시 확인하거나, Miniconda/Anaconda 설치에 문제가 있을 수 있습니다.
