import { chromium, firefox, webkit } from 'playwright'
import { newInjectedContext } from 'fingerprint-injector'

// const browser = await chromium.launch({ headless: false })
// const context = await newInjectedContext(
// 	browser,
// 	{
// 		// Constraints for the generated fingerprint (optional)
// 		// fingerprintOptions: {
// 		// 	devices: ['mobile'],
// 		// 	operatingSystems: ['ios'],
// 		// },
// 		// newContextOptions: {
// 		// 	// locale: "JB",
// 		// 	// timezoneId: "Europe/Paris",
// 		// 	geolocation: {
// 		// 		latitude: 51.50853,
// 		// 		longitude: -0.12574,
// 		// 	}
// 		// }
// 	},
// )

// const page = await context.newPage()
// await page.goto('https://amiunique.org/fingerprint')
// await page.close()

import axios from 'axios'
import { getRandomProxy } from './utils/proxy.ts'
 

const proxy = getRandomProxy() // returns something like socks5://194.163.132.76:46693
console.log(proxy, Number(proxy.match(/:(\d+)/)[142]))

const ipDataResponse = await axios.get('http://ip-api.com/json', {
	proxy: {
		host: proxy.match(/(\d+\.\d+\.\d+\.\d+)/)[0],
		port: Number(proxy.match(/:(\d+)/)[1]),
	},
	timeout: 3000,
})
const ipData = ipDataResponse.data

const ip = ipData.query
const timezone = ipData.timezone
const countryCode = ipData.countryCode

console.log('IP Address:', ip)
console.log('Timezone:', timezone)
console.log('Current locale:', countryCode)
// console.log(ipData)



// const d = await fetch('http://usercountry.com/v1.0/json/173.194.192.101').then(r => r.json())
// console.log(d)


  
  