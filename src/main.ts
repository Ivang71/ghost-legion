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
import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()


const activeKeys = new Set()




AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
})
const ec2 = new AWS.EC2()

const launchEC2 = async (MaxCount = 1) => {
    const proxySetupScript = `#!/bin/bash
        sudo su
        apt update -y
        apt install -y squid
        systemctl enable squid
        cp /etc/squid/squid.conf /etc/squid/squid.conf.bak
        sed -i 's/http_access deny all/http_access allow all/' /etc/squid/squid.conf
        systemctl start squid
        sudo service squid restart`

    const instanceParams = {
        ImageId: 'ami-0fc5d935ebf8bc3bc',
        InstanceType: 't2.micro',
        KeyName: 'default',
        SubnetId: 'subnet-00e7eff8ecbe1774d',
        SecurityGroupIds: ['sg-0266b224b7b575ac2'],
        UserData: Buffer.from(proxySetupScript).toString('base64'),
        MinCount: 1,
        MaxCount,
    }

    const instanceData = await ec2.runInstances(instanceParams).promise()
    const instanceIds = instanceData.Instances.map(instance => instance.InstanceId)

    await ec2.waitFor('instanceStatusOk', { InstanceIds: instanceIds }).promise()

    const describeData = await ec2.describeInstances({ InstanceIds: instanceIds }).promise()
    const publicIps = describeData.Reservations.map(reservation => reservation.Instances[0].PublicIpAddress)

    return {
        ids: instanceIds,
        ips: publicIps,
    }
}

const terminateEC2Instances = (instanceIds: string[]) => ec2.terminateInstances({InstanceIds: instanceIds}).promise()



const visitTarget = async (proxyUrl: string) => {
    const browser = await chromium.launch({headless: false, proxy: { server: proxyUrl }})
    const context = await newInjectedContext(browser, {
        fingerprintOptions: { devices: [chooseRandom(['mobile', 'desktop'])] },
        newContextOptions: {
            locale: 'US',
            timezoneId: 'America/New_York',
            geolocation: {
                latitude: 39.0438,
                longitude: -77.4874,
            },
        }
    })

    const page = await context.newPage()
    
    await page.goto('https://finula.online')
    await page.waitForSelector('body')

    const postLinks = await page.$$('h2.entry-title a')
    chooseRandom(postLinks).click()
    await page.waitForSelector('body')

    const iframeElementHandle = await page.waitForSelector('iframe[data-aa]')
    const iframe = await iframeElementHandle.contentFrame()
    await iframe.click('body')
    await page.waitForSelector('body')
    await page.waitForTimeout(1000)
    await browser.close()

    // for (let i = 0; i < randint(5, 10); i++) {
    //   await page.evaluate(scrollIncrement => {
    //     window.scrollBy(0, scrollIncrement)
    //   }, randint(97, 145))
    //   await page.waitForTimeout(randint(200, 500))
    // }
}

try {
    const ec2s = await launchEC2(1).catch(log)
    // if (!ec2s) throw "No m̶a̶i̶d̶e̶n̶s̶ proxies?"
    // await Promise.all(ec2s.ips.map(ip => visitTarget(`http://${ip}:3128`)))
    // await terminateEC2Instances(ec2s.ids)
} catch (e) {
    console.error(e)
}
