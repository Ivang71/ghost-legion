import { chromium, firefox, webkit } from 'playwright'
import { newInjectedContext } from 'fingerprint-injector'
import { log } from 'console'
import chalk from 'chalk'
import { getRandomProxy } from './utils/proxy.ts'
import { ProxyInfo, IpApi } from './types/index.ts'
import { HttpProxyAgent } from 'http-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import * as http from 'http'
import { spawn } from 'child_process'
import fetch from 'node-fetch'

import { portManager } from './entities/port-manager.ts'
import { randChoice as chooseRandom, randint } from './utils/index.ts'


const activeKeys = new Set()




// const startProxyServer = async () => {
//     while (true) {
//         const key = keys.find((key) => !activeKeys.has(key) && key.working)
//         if (!key) throw "Cannot find a free key. Deal with it"
//         const port = portManager.allocatePort()
//         if (!port) throw "Cannot find a free port for a proxy server"
//         const localAddress = `socks5://localhost:${port}`
//         const proxy = spawn('npx', ['--yes', '@stableness/shadowsocks-node', '--local', localAddress, '--remote', key.key])
//         proxy.on('error', (err) => console.error(`Error starting proxy server: ${err.message}`))    
//         proxy.on('exit', (code) => log(`Proxy server ${port} exited with code ${code}`))
//         // wait for proxy to start. TODO make it normal
//         await new Promise(r => setTimeout(r, 3000))

//         // test that ss server works
//         const agent = new SocksProxyAgent(localAddress, {timeout: 6000})
//         try {
//             const response = await fetch('http://ip-api.com/json', { agent })
//             const ipInfo = await response.json() as IpApi
//             return {
//                 address: localAddress,
//                 info: ipInfo
//             }
//         } catch (e) {
//             proxy.kill()
//             key.working = false
//         }
//     }
// }



// let a: string, i: IpApi
// try {
//     const { address, info } = await startProxyServer()
//     a = address
//     i = info
// } catch (e) {
//     console.error(e)
// }
// log(a, '\n', i)


// i =  {
//     status: 'success',
//     country: 'Singapore',
//     countryCode: 'SG',
//     region: '01',
//     regionName: 'Central Singapore',
//     city: 'Singapore',
//     zip: '069536',
//     lat: 1.27989,
//     lon: 103.849,
//     timezone: 'Asia/Singapore',
//     isp: 'OVH SAS',
//     org: 'OVH Singapore PTE. LTD',
//     as: 'AS16276 OVH SAS',
//     query: '51.79.207.10'
// }


const visitTarget = async () => {
    const browser = await chromium.launch({headless: false/*, proxy: { server: a }*/})
    const context = await newInjectedContext(browser, {
        fingerprintOptions: { devices: [chooseRandom(['mobile', 'desktop'])] },
        // newContextOptions: {
        //     locale: i.countryCode,
        //     timezoneId: i.timezone,
        //     geolocation: {
        //         latitude: i.lat,
        //         longitude: i.lon,
        //     },
        // }
    })

    const page = await context.newPage()
    
    await page.goto('https://finula.online') // https://hime4qrsy1.execute-api.us-east-1.amazonaws.com/stage1/proxy
    await page.waitForSelector('body')

    const postLinks = await page.$$('h2.entry-title a')
    chooseRandom(postLinks).click()
    await page.waitForSelector('body')

    const iframeElementHandle = await page.waitForSelector('iframe[data-aa]')
    const iframe = await iframeElementHandle.contentFrame()
    await iframe.click('body')
    await page.waitForSelector('body')
    await page.waitForTimeout(300)
    await browser.close()
  
    // for (let i = 0; i < randint(5, 10); i++) {
    //   await page.evaluate(scrollIncrement => {
    //     window.scrollBy(0, scrollIncrement)
    //   }, randint(97, 145))
    //   await page.waitForTimeout(randint(200, 500))
    // }
}

try {
    // await visitTarget()
    const promises = Array.from({length: 10}, () => null)
    Promise.all(promises.map(() => visitTarget()))
} catch (e) {
    console.error(e)
}





// /* this shit doesn't crash
// const getProxyData = async (): Promise<IpInfo | null> => {
// 	try {
// 		const proxy = getRandomProxy()
// 		const timeout = 5000
// 		const targetUrl = 'http://ip-api.com/json'
// 		const agent = proxy.startsWith('http') ? new HttpProxyAgent(proxy, {timeout}) : new SocksProxyAgent(proxy, {timeout})
// 		let ipDataResponse = ''
// 		log(proxy)
		
// 		const response = await new Promise<string>((resolve, reject) => {
// 			const req = http.get(targetUrl, {agent, timeout}, (res) => {
// 				res.on('data', (chunk) => {
// 					ipDataResponse += chunk
// 				})
				
// 				res.on('end', () => {
// 					resolve(ipDataResponse)
// 				})

// 				res.on('error', (error) => {
// 					reject(error)
// 				})

// 				res.on('timeout', (error) => {
// 					reject(new Error('Request timed out'))
// 				})
// 			})

// 			req.on('error', (error) => {
// 				reject(error)
// 			})

// 			req.end()
// 		})

// 		const ipData = JSON.parse(response)
// 		return {
// 			ip: ipData.query,
// 			locale: ipData.countryCode,
// 			timezoneId: ipData.timezone,
// 			geolocation: {
// 				latitude: ipData.lat,
// 				longitude: ipData.lon,
// 			}
// 		}
// 	} catch (error) {
// 		log(error)
// 		return null
// 	}
// }
// */

// const getProxyData = async (): Promise<IpInfo> => {
// 	const proxy = getRandomProxy()
// 	const timeout = 5000
// 	const targetUrl = 'http://ip-api.com/json'
// 	const agent = proxy.startsWith('http') ? new HttpProxyAgent(proxy, {timeout}) : new SocksProxyAgent(proxy, {timeout})
// 	let ipDataResponse = ''

// 	try {
// 		return new Promise((resolve) => {
// 			const req = http.get(targetUrl, {agent, timeout}, (res) => {
// 				res.on('data', (chunk) => {
// 					ipDataResponse += chunk
// 				})
	
// 				res.on('end',() => {
// 					const ipData = JSON.parse(ipDataResponse)
// 					resolve({
// 						ip: ipData.query,
// 						locale: ipData.countryCode,
// 						timezoneId: ipData.timezone,
// 						geolocation: {
// 							latitude: ipData.lat,
// 							longitude: ipData.lon,
// 						}
// 					})
// 				})

// 				res.on('error', (error) => {
// 					resolve(null)
// 				})
// 				res.on('timeout', (error) => {
// 					resolve(null)
// 				})
// 			})
			
// 			req.on('error', (error) => {
// 				resolve(null)
// 			})
// 		})
// 	} catch (e) {
// 		return null
// 	}
// }

// const getWorkingProxyInfo = async () => {
// 	let found = false, proxyInfo: Array<IpInfo | null>

// 	while (!found) {
// 		try {
// 			proxyInfo = await Promise.all(Array(10).fill(null).map(() => getProxyData()))
// 			log('proxyInfo', proxyInfo)
// 			found = false
// 		} catch (e) {
// 			log(e)
// 		}
// 	}
// 	return proxyInfo
// }

// let ipInfo
// try {
// 	ipInfo = await getWorkingProxyInfo()
// } catch (e) {
// 	log(e)
// }
// log('Found working proxy:', ipInfo)

