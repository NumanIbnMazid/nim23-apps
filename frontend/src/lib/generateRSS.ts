import { writeFileSync } from 'fs'
// @ts-ignore
import RSS from 'rss'

export default async function getRSS() {
  const siteURL = 'https://nim23.com'

  // Create a new RSS object
  const feed = new RSS({
    title: 'NIM23 APPS',
    description: `NIM23 APPS - A collection of apps offered by NIM23`,
    site_url: siteURL,
    feed_url: `${siteURL}/feed.xml`,
    language: 'en',
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, Numan Ibn Mazid`,
  })
  // Write the RSS feed to a file
  writeFileSync('./public/feed.xml', feed.xml({ indent: true }))
}
