import requests
import json
import datetime

URL = "https://preprod-generativelanguage.googleapis.com"
API_KEY = "AIzaSyCdfmhXMedLBaBhqyTAay1yQFC8blWoybc"  


def parse_json_stream(response):
    """Parses a stream of strings containing JSON objects.

    Args:
        response: The HTTP response object.

    Yields:
        dict: Parsed JSON objects.
    """
    decoder = json.JSONDecoder(strict=False)
    buffer = ""
    for chunk in response.iter_content(chunk_size=None):
        buffer += chunk.decode("utf-8")
        buffer = buffer[buffer.find("{"):]
        while True:
            try:
                obj, idx = decoder.raw_decode(buffer)
                yield obj
                buffer = buffer[idx:]
            except json.JSONDecodeError:
                # Incomplete JSON object
                break


def query_endpoint_streamed(request):
    """Sends a POST request to the API endpoint and processes the streamed response."""
    model = request.get("model")
    try:
        print("Request:")
        print("----------------------------------------")
        print(json.dumps(request, indent=2))
        print("----------------------------------------")

        session = requests.Session()
        start_time = datetime.datetime.now()

        with session.post(
            f"{URL}/v1beta/{model}:generateContent?key={API_KEY}",
            data=json.dumps(request),
            headers={"Content-Type": "application/json"},
            timeout=300,
            stream=True,
        ) as response:
            for streamed_response in parse_json_stream(response):
                receive_time = datetime.datetime.now()
                print(
                    f"Response: [latency:{(receive_time - start_time).total_seconds()} s]"
                )
                print("----------------------------------------")
                print(json.dumps(streamed_response, indent=2))
                print("----------------------------------------")

            response.raise_for_status() 

    except requests.exceptions.HTTPError as e:
        print("Request failed:", e)
        print(e.request.url)
        print(e)
        print(e.response.text)
        raise e


request_data = {
    "model": "models/chat-bard-advanced-hni",
    "generationConfig": {"candidateCount": 1},
    "contents": [
        {
            "role": "user",
            "parts": [
                {
                    "text": """Build a very modern video game progress checker using react with vite where I can register my video games by title, release date, and console, and log my game progress.
                    Also include features such as a filter and search bar. The filter should have a clear reset option.
                    Additionally, add default games to minimize user effort.
                    Consoles should be a dropdown.
                    - Do not use custom CSS, use TailwindCSS only.
                    - Use Inter font with a fresh, modern color palette.
                    - Ensure rounded corners, gradients, and hover effects are effectively applied.
                    - For icons, use Lucide-react.
                    - Avoid using alert() to show messages. Instead, use a message box for user communication."""
                }
            ]
        }
    ]
}

query_endpoint_streamed(request_data)
