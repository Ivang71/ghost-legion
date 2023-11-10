export const randChoice = (a) => a[Math.floor(Math.random() * a.length)]
export const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// import requests
// from bs4 import BeautifulSoup

// response = requests.get("https://ad.a-ads.com/2274963?size=300x250")
// response.raise_for_status()
// soup = BeautifulSoup(response.text, "html.parser")
// link = soup.select_one("div.cell a").get('href')
// print("Visiting link...")
// response = requests.get(link, allow_redirects=True)

// print('Final URL:', response.url)

// # Print the status code of the response
// print('Status Code:', response.status_code)

// # Print the content of the response
// print('Response Content:', response.text)

// # Print the URLs in the redirect chain
// print('Redirect Chain:')
// for redirect in response.history:
//     print(redirect.url)