import axios from 'axios'

const getRandom = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]

const fetchProxyList = async (protocol: string): Promise<string[]> => {
    const response = await axios.get(`https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/${protocol}.txt`)
    return response.data.split('\n').map((line: string) => `${protocol}://${line.trim()}`)
}

const fetchAllProxies = async (): Promise<string[]> => {
    const protocols = ['socks5', 'socks4', 'http']
    const proxyPromises: Promise<string[]>[] = protocols.map(protocol => fetchProxyList(protocol))
    const allProxyLists = await Promise.all(proxyPromises)
    return allProxyLists.reduce((accumulator, current) => [...accumulator, ...current], [])
}

const proxies = await fetchAllProxies()

export const getRandomProxy = () => getRandom(proxies)

