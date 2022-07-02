import axios from "axios"

const videoBaseUrl = 'https://www.youtube.com/watch?v='
const defaultId = 'dQw4w9WgXcQ'

export async function getYoutubeLink(query) {
  const apiKey = process.env.YOUTUBE_API_KEY
  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&type=video&part=snippet&q=${encodeURI(query)}`
  console.log(`Youtube query url: ${url}`)
  let videoId = defaultId

  try {
    const res = await axios.get(url)
    const firstId = res.data.items[0].id.videoId

    if (firstId) {
      videoId = firstId
    }
  } catch (e) {
    console.error(e)
  }

  return `${videoBaseUrl}${videoId}`
}
