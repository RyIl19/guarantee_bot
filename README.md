# Hello, I have done this **Guarantee bot** and want to share it freely.

That is my first project on GitHub so please don't be so strict 🙂, however, I would really appreciate you for *serious* and *honest* code review.
It is a free bot so if you find it useful for you, you can use it for all purposes, which **DON'T** violate neither **Terms of Service** or **laws** of commercial organizations or countries.
The only condition I have is to mention me in your production version and `package.json` as a co-author.

---

## 🔍 Some tips and rules, how to use this bot:
1) Please don't use this bot as a real ready production project, because there is no connected database and admin panel system.
2) It is done in little period of time so here might be some bugs, mistakes etc.
3) The `tsconfig.json` file includes Typescript settings used to build this bot.

---

## 🚀 How to use:
1) Download all packages to your device.
2) Open your IDE
3) Write in terminal:
    `npm init`
And setup packet.json
4) Add in package.json scripts:
    ``` json
    "build": "tsc",
    "start": "node dist/index.js"
    ```
5) Check that you have folder dist in the root of your project
6) Install next libraries:
    "**axios**": "^1.13.2",
    "**dotenv**": "^17.2.3",
    "**i18next**": "^25.6.0",
    "**i18next-fs-backend**": "^2.6.0",
    "**node-telegram-bot-api**": "^0.66.0",
    "**tronweb**": "^6.0.4"
Command for their installation:
    `npm i axios dotenv i18next i18next-fs-backend node-telegram-bot-api tronweb`
7) Install Developer libraries:
    "**@types/node**": "^24.9.2",
    "**@types/node-telegram-bot-api**": "^0.64.12",
    "**typescript**": "^5.9.3"
Command for their installation:
    `npm i -D @types/node @types/node-telegram-bot-api typescript`
8) Use command "tsc -init"
9) Replace __tsconfig.json__ with offered by me
9) Check file __process.env__ in the root of your project. Add here your **bot token**, **tron api key** and **tron private key** to the highlighted positions.
10) Add necessary information to config.json:
    1. Support tag
    2. Comission fee in percents e.g. *3* is 3%, *15* is 15%
    3. Wallet address where you want to get comission fee and publick key add only if you have already added private key
11) Setup your bot in Telegram, you can use logos and description from **`bot_profile`** folder.

12) Execute in terminal:
    `npm run build`
    `npm start`
13) 🎉 Enjoy bot

## P.S.
Feel free to commit, share and modify code.
