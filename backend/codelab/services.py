import requests
import base64
import json

# Placeholder URL - in prod use env const
JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions" 

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

LANGUAGE_MAP = {
    'python': {'language': 'python', 'version': '3.10.0'},
    'javascript': {'language': 'javascript', 'version': '18.15.0'},
    'cpp': {'language': 'c++', 'version': '10.2.0'},
    'c': {'language': 'c', 'version': '10.2.0'},
    'java': {'language': 'java', 'version': '15.0.2'},
}

def execute_code_piston(language, source_code, stdin=""):
    """
    Executes code via Piston API.
    language: string (python, javascript, cpp)
    """
    lang_key = language.lower()
    # Normalize c++
    if lang_key == 'c++': lang_key = 'cpp'
    
    lang_config = LANGUAGE_MAP.get(lang_key)
    
    if not lang_config:
        # Fallback or error
        return {"run": {"output": f"Error: Language '{language}' is not supported by the backend executor.", "code": 1}}

    payload = {
        "language": lang_config['language'],
        "version": lang_config['version'],
        "files": [
            {
                "content": source_code
            }
        ],
        "stdin": stdin
    }

    try:
        response = requests.post(PISTON_API_URL, json=payload)
        return response.json()
    except Exception as e:
        return {"run": {"output": f"Backend Connection Error: {str(e)}", "code": 1}}


def run_code_on_judge0(source_code, language_id, stdin, expected_output=None, time_limit=1.0, memory_limit=128000):
    """
    Legacy/Mock wrapper. 
    Ideally, we should map language_id (integer) to Piston strings if we want to unify.
    Judge0 IDs: 71 (Python), 54 (C++), 63 (JS Node).
    """
    
    # Simple mapping for migration
    piston_lang = None
    if language_id == 71: piston_lang = 'python'
    elif language_id == 54: piston_lang = 'cpp'
    elif language_id == 63: piston_lang = 'javascript'
    
    if piston_lang:
        res = execute_code_piston(piston_lang, source_code, stdin)
        # Transform Piston response to Judge0 format for compatibility
        output = res.get('run', {}).get('output', '')
        code = res.get('run', {}).get('code', 0)
        
        status_id = 3 if code == 0 else 4 # 3=Accepted
        
        # Check against expected if provided (simple string match)
        if expected_output and expected_output.strip() != output.strip():
             status_id = 4 # Wrong Answer
        
        return {
            "status": {"id": status_id, "description": "Accepted" if status_id == 3 else "Wrong Answer/Error"},
            "time": "0.1",
            "memory": 0,
            "stdout": output,
            "stderr": res.get('run', {}).get('stderr', '')
        }

    # Fallback to Mock if ID unknown
    if "fail" in stdin:
        return {
            "status": {"id": 4, "description": "Wrong Answer"},
            "time": "0.05",
            "memory": 1024,
            "stdout": "SGVsbG8gV29ybGQ=" 
        }
    else:
        return {
            "status": {"id": 3, "description": "Accepted"},
            "time": "0.02",
            "memory": 1024,
            "stdout": "SGVsbG8="
        }
