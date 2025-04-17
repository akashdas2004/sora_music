from flask import Flask, request, jsonify
from ytmusicapi import YTMusic
import yt_dlp

app = Flask(__name__)
ytmusic = YTMusic()

@app.route("/search", methods=["GET"])
def search_songs():
    query = request.args.get("query")
    if not query:
        return jsonify({"success": False, "message": "Missing query"}), 400

    try:
        results = ytmusic.search(query, filter="songs")
        top_results = []

        for item in results[:10]:  # return top 10 results
            top_results.append({
                "title": item.get("title"),
                "artist": ", ".join([a['name'] for a in item.get("artists", [])]),
                "videoId": item.get("videoId"),
                "duration": item.get("duration"),
                "thumbnail": item.get("thumbnails", [{}])[-1].get("url")
            })

        return jsonify({"success": True, "results": top_results})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/stream-url", methods=["GET"])
def get_stream_url():
    query = request.args.get("query")
    if not query:
        return jsonify({"success": False, "message": "Missing query"}), 400

    try:
        results = ytmusic.search(query, filter='songs')
        if not results:
            return jsonify({"success": False, "message": "No song found"}), 404

        video_id = results[0]['videoId']
        url = f"https://www.youtube.com/watch?v={video_id}"

        ydl_opts = {
            'format': 'bestaudio[abr<=128]',
            'quiet': True,
            'skip_download': True,
            'forceurl': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info['url']

        return jsonify({"success": True, "stream_url": stream_url})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
