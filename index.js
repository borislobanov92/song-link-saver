import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

import { getYoutubeLink } from './src/youtube.js'
import { getAppleMusicLink } from './src/apple_music.js'
import { getVKLink } from './src/vk.js'

dotenv.config()

const app = express()
app.use(express.json())

app.post('/new-message', async (req, res) => {
  const { message } = req.body
  if (!message) {
    return res.end()
  }

  try {
    const userId = message.chat.id

    if (!userId) {
      console.error('userId is empty', message)
      return res.end()
    }

    const text = message.text

    if (!text) {
      console.error('text is empty', message)
      return res.end()
    }

    console.log(`User message text: ${text}`)

    const tgBotToken = process.env.TELEGRAM_BOT_TOKEN

    if (text === '/start') {
      console.log(`Started chat with user ${userId}`)
      return axios
        .post(
          `https://api.telegram.org/bot${tgBotToken}/sendMessage`,
          {
            chat_id: userId,
            text: 'Please enter song title and hashtags with spaces (e.g. "Black dog - Led Zeppelin #rock #blues #guitars")',
          }
        )
        .then(() => {
          res.end('ok')
        })
        .catch((err) => {
          console.error('Error :', err)
          res.end('Error :' + err)
        })
    }

    const hashtags = text.match(/#[\w]+/g) ?? []
    const songTitle = text.split(' #')[0]
    const formattedMessage = await getFormattedMessage(songTitle, hashtags)

    return axios
      .post(
        `https://api.telegram.org/bot${tgBotToken}/sendMessage`,
        {
          chat_id: userId,
          text: formattedMessage,
        }
      )
      .then(() => {
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

async function getFormattedMessage(songTitle, hashtags) {
  const ytLink = await getYoutubeLink(songTitle)
  const vkLink = await getVKLink(songTitle)
  const appleMusicLink = await getAppleMusicLink(songTitle)

  let message = `${hashtags.join(' ')}\nYouTube: ${ytLink}\n`
  if (vkLink) {
    message += `VK: ${vkLink}\n`
  }

  if (appleMusicLink) {
    message += `Apple Music: ${appleMusicLink}\n`
  }

  console.log(message)

  return message
}

app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})