import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

import { getFirstResult } from './src/youtube.js'
import { getAppleMusicLink } from './src/apple_music.js'
import { getVKLink } from './src/vk.js'

dotenv.config()

const app = express()
app.use(express.json())

const tgChannelId = '-1001626321432'

app.post('/new-message', async (req, res) => {
  const { message } = req.body
  if (!message) {
    return res.end()
  }

  try {
    const text = message.text

    if (!text) {
      console.error('text is empty', message)
      return res.end()
    }

    const tgBotToken = process.env.TELEGRAM_BOT_TOKEN
    const formattedMessage = await getFormattedMessage(text)

    axios
      .post(
        `https://api.telegram.org/bot${tgBotToken}/sendMessage`,
        {
          chat_id: tgChannelId,
          text: formattedMessage,
        }
      )
      .then((response) => {
        console.log('Message posted')
        res.end('ok')
      })
      .catch((err) => {
        console.error('Error :', err)
        res.end('Error :' + err)
      })
  } catch (err) {
    console.error(err)
  }
})

async function getFormattedMessage(songTitle) {
  const hashTags = ['#touriev', '#music']
  const ytLink = await getFirstResult(songTitle)
  const vkLink = await getVKLink(songTitle)
  const appleMusicLink = await getAppleMusicLink(songTitle)

  const message = `${hashTags.join(' ')}\nYouTube: ${ytLink}\nVK: ${vkLink}\nApple Music: ${appleMusicLink}\n`
  console.log(message)

  return message
}

app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})