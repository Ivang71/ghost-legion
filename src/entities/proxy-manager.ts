import * as path from 'path'
import { fileURLToPath } from 'url'
import { ProxyInfo } from "../types";
import * as cheerio from 'cheerio'
import * as fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


class ProxyManager {
    private proxies: ProxyInfo[] = []

    constructor(private jsonPath: string = '../ss-keys.json') {}

    saveState = () => {
        if (this.proxies.length > 0) {
            fs.writeFileSync(this.jsonPath, JSON.stringify(this.proxies, null, 2))
        }
    }

    updateKeysJson = async () => {
        let fetchedKeys = await ProxyManager.fetchProxies()
        if (fs.existsSync(this.jsonPath)) {
            const savedKeys = JSON.parse(fs.readFileSync(path.join(__dirname, this.jsonPath), 'utf-8')) as ProxyInfo[]
            fetchedKeys.forEach(obj => {
                if (!savedKeys.some((item) => item.key === obj.key)) {
                  savedKeys.unshift(obj)
                }
            })
            fetchedKeys = savedKeys
        }
        fetchedKeys = fetchedKeys.slice(0, 50)
        fs.writeFileSync(this.jsonPath, JSON.stringify(fetchedKeys, null, 2))
    }

    static fetchProxies = async (): Promise<ProxyInfo[]> => {
        // get ids of pages containing the keys
        const ids = (await Promise.all(['', 'page/2/'].map(async (appendix) => {
            const r = await fetch('https://outline.network/access-keys/' + appendix)
            const $ = cheerio.load(await r.text())
            return $('article[id^="post-"]').map((_, article) => $(article).attr('id').match(/\d+/)[0]).get()
        }))).flat()    
        // get ss keys by the page ids
        return Promise.all(ids.map(async (id) => {
            const r = await fetch('https://outline.network/access-keys/' + id)
            const $ = cheerio.load(await r.text())
            return {
                key: $('.elementor-element.elementor-element-61f0c35').text().trim().replace(/#.*/, ''),
                working: true,
                lastUsed: 0,
            }
        }))
    }
}


export const proxyManager = new ProxyManager()


process.on('exit', (code) => {
    proxyManager.saveState()
    process.exit(0)
})

process.on('uncaughtException', (err) => {
    proxyManager.saveState()
    process.exit(1)
})
