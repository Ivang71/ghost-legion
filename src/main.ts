import { chromium } from 'playwright'
import { newInjectedContext } from 'fingerprint-injector'

const browser = await chromium.launch({ headless: false })
const context = await newInjectedContext(
	browser,
	{
		// Constraints for the generated fingerprint (optional)
		fingerprintOptions: {
			devices: ['mobile'],
			operatingSystems: ['ios'],
		},
		// Playwright's newContext() options (optional, random example for illustration)
		newContextOptions: {
			locale: "JB",
			timezoneId: "Europe/Paris",
			geolocation: {
				latitude: 51.50853,
				longitude: -0.12574,
			}
		}
	},
)

const page = await context.newPage()
await page.goto('https://amiunique.org/fingerprint')
// await page.close()


// const ipData = await fetch('http://ip-api.com/json').then(r => r.json())
  
// const ip = ipData.query,
// 	timezone = ipData.timezone,
// 	countryCode = ipData.countryCode

// console.log('IP Address:', ip)
// console.log('Timezone:', timezone)
// console.log('Current locale:', countryCode)
// console.log(ipData);

// const d = await fetch('http://usercountry.com/v1.0/json/173.194.192.101').then(r => r.json())
// console.log(d);


  
  