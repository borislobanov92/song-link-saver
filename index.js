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
const whitelistedUsers = ['65453735']

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

    if (!whitelistedUsers.includes(userId.toString())) {
      console.error(`User ${userId} is not allowed to post messages`)
      return res.end()
    }

    const text = message.text

    if (!text) {
      console.error('text is empty', message)
      return res.end()
    }

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
        .then((response) => {
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
          chat_id: tgChannelId,
          text: formattedMessage,
        }
      )
      .then((response) => {
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
  const ytLink = await getFirstResult(songTitle)
  const vkLink = await getVKLink(songTitle)
  const appleMusicLink = await getAppleMusicLink(songTitle)

  const message = `${hashtags.join(' ')}\nYouTube: ${ytLink}\nVK: ${vkLink}\nApple Music: ${appleMusicLink}\n`
  console.log(message)

  return message
}

app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})