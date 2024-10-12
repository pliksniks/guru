import { Client, ClientEvents } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

export function loadEvents(client: Client) {
  const eventsPath = join(__dirname, '..', 'events')
  const eventFiles = readdirSync(eventsPath).filter((file) =>
    file.endsWith('.ts'),
  )

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file)
    import(filePath)
      .then((eventModule) => {
        const event = eventModule.default
        if (typeof event === 'function') {
          // If the event export is a function, assume it's the handler
          const eventName = file.split('.')[0]
          client.on(eventName as keyof ClientEvents, (...args) =>
            event(client, ...args),
          )
        } else if (event && typeof event === 'object') {
          // If it's an object with name and execute properties
          if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args))
          } else {
            client.on(event.name, (...args) => event.execute(client, ...args))
          }
        }
      })
      .catch((error) => {
        console.error(`Error loading event ${file}:`, error)
      })
  }
}
