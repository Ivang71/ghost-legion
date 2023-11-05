import { chromium, firefox, webkit } from 'playwright'
import { newInjectedContext } from 'fingerprint-injector'
import { log } from 'console'
import chalk from 'chalk'
import { getRandomProxy } from './utils/proxy.ts'
import { ConnectionKey, IpApi } from './types/index.ts'
import { HttpProxyAgent } from 'http-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import * as http from 'http'
import { spawn } from 'child_process'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import * as fs from 'fs'

import * as path from 'path'
import { fileURLToPath } from 'url'
import { portManager } from './entities/port-manager.ts'


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const keys: ConnectionKey[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../ss-keys.json'), 'utf-8'))
const activeKeys = new Set()

const saveState = () => fs.writeFileSync('ss-keys.json', JSON.stringify(keys, null, 2))

process.on('exit', (code) => {
    saveState()
    process.exit(0)
})

process.on('uncaughtException', (err) => {
    saveState()
    process.exit(1)
})


const startProxyServer = async () => {
    while (true) {
        const key = keys.find((key) => !activeKeys.has(key) && key.working)
        if (!key) throw "Cannot find a free key. Deal with it"
        const port = portManager.allocatePort()
        if (!port) throw "Cannot find a free port for a proxy server"
        const localAddress = `socks5://localhost:${port}`
        const proxy = spawn('npx', ['--yes', '@stableness/shadowsocks-node', '--local', localAddress, '--remote', key.key])
        proxy.on('error', (err) => console.error(`Error starting proxy server: ${err.message}`))    
        proxy.on('exit', (code) => log(`Proxy server ${port} exited with code ${code}`))
        // wait for proxy to start. TODO make it normal
        await new Promise(r => setTimeout(r, 3000))

        // test that ss server works
        const agent = new SocksProxyAgent(localAddress, {timeout: 6000})
        try {
            const response = await fetch('http://ip-api.com/json', { agent })
            const ipInfo = await response.json() as IpApi
            return {
                address: localAddress,
                info: ipInfo
            }
        } catch (e) {
            proxy.kill()
            key.working = false
        }
    }
}


let a, i
try {
    const { address, info } = await startProxyServer()
    a = address
    i = info
} catch (e) {
    console.error(e)
}
log(a, '\n', i)







const updateKeysJson = async () => {
    // get ids of pages containing the keys
    const ids = (await Promise.all(['', 'page/2/'].map(async (appendix) => {
        const r = await fetch('https://outline.network/access-keys/' + appendix)
        const $ = cheerio.load(await r.text())
        return $('article[id^="post-"]').map((_, article) => $(article).attr('id').match(/\d+/)[0]).get()
    }))).flat()

    // get ss keys by the page ids
    const keys = await Promise.all(ids.map(async (id) => {
        const r = await fetch('https://outline.network/access-keys/' + id)
        const $ = cheerio.load(await r.text())
        return {
            working: true,
            key: $('.elementor-element.elementor-element-61f0c35').text().trim().replace(/#.*/, ''),
        }
    }))

    fs.writeFileSync('ss-keys.json', JSON.stringify(keys, null, 2))
}




