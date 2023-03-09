---
title: GraphQL API 与 Node.js 和 MongoDB：JWT 身份验证（译）
createdAt: 2023-03-09T01:30+0800
tags:
  - NodeJS
  - GraphQL
  - MongoDB
description: 本文演示`GraphQL API` 风格的 JWT 认证。用到：`Node.js`、`MongoDB`、`Redis`、`Apollo Server`。
type: '译'
---

[原文](https://codevoweb.com/graphql-api-with-node-mongodb-jwt-authentication)

本文演示`GraphQL API` 风格的 JWT 认证。用到：`Node.js`、`MongoDB`、`Redis`、`Apollo Server`。

此外，还会学到以访问（Access Token）和刷新令牌（Refresh Token）为 **HTTPOnly** cookies，来实现 JWT 认证。

## Node.js GraphQL API

### 建项目

要初始化一个新的Node.js项目，在你的终端运行以下命令。

``` shell
mkdir node-graphql-api # 建目录
cd node-graphql-api # 进目录
pnpm init # 初始化
```

### 用 Docker-compose 设置 MongoDB 和 Redis

Docker 辅以 Docker-compose 可快速启用 MongoDB 和 Redis服务。

本文假设你电脑上已安装 [Docker](https://docs.docker.com/get-docker/) 及 [Docker-compose](https://docs.docker.com/compose/install/)。

在根目录下，创建文件 `docker-compose.yml`，并添加以下代码片段，以便配置并运行容器 MongoDB、Redis。

``` yaml
# docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo
    container_name: mongodb
    ports:
      - '6000:27017'
    volumes:
      - mongodb:/data/db
    env_file:
      - ./.env
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - '6379:6379'
    volumes:
      - redis:/data
volumes:
  # eslint-disable yml/no-empty-mapping-value
  redis:
  mongodb:
```

下一步，设置环境变量，以提供 MongoDB Docker 镜像所需凭证

### 设置环境变量

环境变量乃程序中最关键部分。安全总是重中之重，敏感数据需如 API 密钥、密码等，要专门存储。

本例将上述信息存储在名为 `.env` 文件中，并使用[`dotenv`](https://www.npmjs.com/package/dotenv) 包来加载。

另外，用 [`config`](https://www.npmjs.com/package/config) 库来设置和检索环境变量。

``` shell
pnpm add dotenv config -D
```

``` shell
# .env
NODE_ENV=development
PORT=8000

MONGODB_URI_LOCAL=mongodb://admin:password123@localhost:6000/node_graphql?authSource=admin

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=node_graphql

JWT_ACCESS_PRIVATE_KEY=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDV3dJQkFBS0JnR2hDMjI2ZEtBeW5NL0tpV3dKVFcySjRnLzl5QTdNWGtHOGppd1p1WGhyeWMzMURxeEdPClZhL0dIa1dxV1lnTkR5WG1lQ1RzVmsvQWdsS3FrOEJHQU1tYUpYSGM4YjVmd0QrRWFXRTVOUUFEMHQyM0VsZ1MKQkovK3ZkK1FwZTFtbjcrT1dZdmt2ODI3VlBDRXZHT1hKYVpLU0VMVDMyaHdialpUTUdTKzBEK0RBZ01CQUFFQwpnWUE4VDJCTGJoRTZzSVcyTndCYUtnblV2azNzdC9FMzZjdWMzbnlQTGN5MTNjVzhraVlrczZjUlZKTXlUVVlaCkV5VE9FYkV4K3B3NjZlcjVFcjhCRy8xYjVBUDYwL2dOZXlPWXE5d3huSWpLRmFzbFE0dDNsa29EdUNMRS9qT1QKcWw4NmpNbis3VG1CRHI2L1V1WmZmM0t1UXB5K2tPN3pSak9wUzh0bU1NUkNRUUpCQUtkcGVTSHJCUFVaWUFkWgpZei85M2Q3NU5DRHhVeGt2YTFmVUdTaFZEd3NDTEhRaVFDZXluZUc0bEpIUjNCTVRiMXlUbFhoVTUxaTR3WGNBCnhDN1JQVEVDUVFDZmJxSG5LQ2VQa2E4VENYL2FSV3NPMTFqQUZnOEZtUys0cnUvTHVpL01JNFNFSXlXMk52aTMKM0lZdStsZUJJNk9Md1gvbVVLaDNwWlBEeHM5TjgwcnpBa0JTYXRKL3FEd2dqZ1dBbUxrTDMrZEN4bHlyZXlMMQoyeXAxYXEyWDlZZ2FXMCtYUE9Wb3BiNmtTVUtiSnoyNUJuQmtteU9Td2ZuQzYvSVNyQVhwSm9tQkFrRUFuTVZSCnlKWndpRGt0MlY5ZTdBZVVwU3hXSmRQTEE2dEZCS3BvTzRFaVhPNlQ4TWNLM3lrZzJ0S3EwMmp4UUpnRnluZ0UKUnpvSzNsUGZnQVJ2ZG13RXh3SkFBVnNPblZNUk8vUkFac0w3VS9MYlB6NmVDQVdzdkN6azU1QWx4bU4zTndoOApsbEt2aElaeG9uc3dGTnB5U2d4ZmExOTVWdlZFemMxMG9KQlhLaUl6M0E9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQ==
JWT_ACCESS_PUBLIC_KEY=LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZU1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTUFEQ0JpQUtCZ0doQzIyNmRLQXluTS9LaVd3SlRXMko0Zy85eQpBN01Ya0c4aml3WnVYaHJ5YzMxRHF4R09WYS9HSGtXcVdZZ05EeVhtZUNUc1ZrL0FnbEtxazhCR0FNbWFKWEhjCjhiNWZ3RCtFYVdFNU5RQUQwdDIzRWxnU0JKLyt2ZCtRcGUxbW43K09XWXZrdjgyN1ZQQ0V2R09YSmFaS1NFTFQKMzJod2JqWlRNR1MrMEQrREFnTUJBQUU9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==

JWT_REFRESH_PRIVATE_KEY=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDWFFJQkFBS0JnUUN6MGhITG9zZXdQcUJTemt6MzdlWHhUb2FPMHB4aDlRb085ME1udU5YNnJwQndNYW9KCng1M1pvYmZiWkFRNktWaXZ3eFd5dkU1ZVdGTlFjRVhkRzlFMlpmQmZ5TTJ3UW9lY1BDVUViaWxjZEFEbGZuR0cKWUdaSTQ2MzBxNGUremRSUHpQdHNNSGpZNk1JSDErSUgxWDlkR3pOVUdXSTllOVRyNmRXRWk2azRZUUlEQVFBQgpBb0dCQUptSGkwQVZURzl6R1FsNk1JY2liRWdhSnBLOHlWNXRpOWY1VHpJVUEwWlVVdWduenlrb2NPS0d5K2FhClAyMjFMWTVyZnhRcTZMSnVzVHVsa0ZEWFZraXF1akVFRHk0cDR6eGJaZFVjc1hZb2dxUHk0T3M0RE43RGt5emYKVGdHZFB3Wm9OeXZlT0lpbzhBV0g5QTJ2aEhkeU5KZ0VIdi8rUHhUbnF2N1dWRXhOQWtFQS83WHB0SUlTNktOcQpUd0NGM1o0bU1IamdwcUZWZHZpM3k0TjVkN3VtTnlqaXVOTlcwd0hGN1VTeFVrV2I0Y2ZRdHZIZ3hMaEhianFtCm00NElqZHMvMXdKQkFMUUdLMEhCM2NxSzJNQUVkalZFa0ZveFYybUNFTzFxeGJFOWRobFJMVlMzY1NCcEgyMjAKZFhrY0ZsL2VTVnRtNG9oLzNQTEZNMmQzYStTek1zUHdJb2NDUVFEVjlpd1FHd3FoV0NOYTZYQVppUHdoY1BOZwoyZnYrS1l6NG9CRWlLNFNnQVBqOGQvSGRhMDFuQkNSdlY4bGdPV2FkdlhRNmhvdFdZNE1IQStpS2NodFBBa0IvCm9Td0R4NjAxam5DUzJkYndkdmFjYXdUYzhYQ00wYmpzcW5WVEI2Rkt3Vzg3bWl2RS9ENllxVmdYaWFHYVludlMKYUV3OTlaODNDSXgrcktrZUR0NTdBa0JGN3hGT0RlVHo1dS9yNE91cHFLeVNJY0gvZWUyckcydkRsVUNZYm1mVgpDeTZXL3lOWDBRTWJYa3kyS3M4d3hZRUlERGlZU1JERk4zaEtPcDlheURiQgotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQ==
JWT_REFRESH_PUBLIC_KEY=LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDejBoSExvc2V3UHFCU3prejM3ZVh4VG9hTwowcHhoOVFvTzkwTW51Tlg2cnBCd01hb0p4NTNab2JmYlpBUTZLVml2d3hXeXZFNWVXRk5RY0VYZEc5RTJaZkJmCnlNMndRb2VjUENVRWJpbGNkQURsZm5HR1lHWkk0NjMwcTRlK3pkUlB6UHRzTUhqWTZNSUgxK0lIMVg5ZEd6TlUKR1dJOWU5VHI2ZFdFaTZrNFlRSURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==

```

::: tip
通常，环境变量用大写。
:::

建议把 `.env` 文件添加到 `.gitignore` 中，以防止误提交。

接下来，在根目录下创建 `config/default.json` 文件并添加以下代码：

``` json
// config/default.json
{
  "port": 8000,
  "nodeEnv": "development",
  "origin": "http://localhost:3000",
  "jwtAccessTokenExpiresIn": 15,
  "jwtRefreshTokenExpiresIn": 60
}
```

### 校验环境变量

`.env` 文件中，若环境变量赋错值或忘记赋值，会导致各种程序中错误。

为避免上述情况，应当校验环境变量，用到包： [envalid](https://www.npmjs.com/package/envalid)：

``` shell
pnpm add envalid -D
```

此包会校验环境变量，若校验不通过，抛出错误。

根目录下，创建 `src` 文件夹，并在其中创建 `utils` 文件夹。

接下来，在 `utils` 文件夹中创建 `validateEnv.js` 文件，并添加以下代码：

``` js
// src/utils/validateEnv.js
import { cleanEnv, port, str } from 'envalid'

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),

    MONGODB_URI_LOCAL: str(),
    MONGO_INITDB_ROOT_USERNAME: str(),
    MONGO_INITDB_ROOT_PASSWORD: str(),
    MONGO_INITDB_DATABASE: str(),

    JWT_ACCESS_PRIVATE_KEY: str(),
    JWT_ACCESS_PUBLIC_KEY: str(),

    JWT_REFRESH_PRIVATE_KEY: str(),
    JWT_REFRESH_PUBLIC_KEY: str(),
  })
}

export default validateEnv
```

配置好 docker-compose 和环境变量，便可启动 Redis 和 MongoDB Docker 容器：

``` shell
docker-compose up -d
```

### 用 Mongoose 创建数据库模式（Schema）

在 `src` 文件夹中创建 `models` 文件夹，并在其中创建 `user.model.js` 文件。

安装 `Mongoose`、`BcryptJs`、`Validator`：

``` shell
pnpm add mongoose bcryptjs validator
```

- [Mongoose](https://mongoosejs.com/) 用于在 nodeJs 异步环境下便捷操作 mongodb
- [BcryptJs](https://www.npmjs.com/package/bcryptjs) 用于散列字符串
- [Validator](https://www.npmjs.com/package/validator) 用于验证用户输入

下面是一个基本的Mongoose模式，列出了创建一个用户所需的字段。

``` js
// src/models/user.model.js
import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, '请提供正确的邮箱'],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, '密码需长于 8 位'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, '请确认密码'],
      validate: {
        validator(val) {
          return val === this.password
        },
        message: '密码不匹配',
      },
    },
    photo: {
      type: String,
      default: 'default.png',
    },
    role: {
      type: String,
      default: 'user',
    },
    verified: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

userSchema.index({ email: 1 })

userSchema.pre('save', async function (next) {
  // 检查是否改密码
  if (!this.isModified('password'))
    return next()

  // 散列强度为 12
  this.password = await bcrypt.hash(this.password, 12)

  // 删除密码确认字段
  this.passwordConfirm = undefined
  next()
})

// 实例方法
userSchema.methods.comparePasswords = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword)
}

const userModel = mongoose.model('User', userSchema)
export default userModel
```

以下是上述内容中需要注意的一些关键事项：

- 哈希密码时，用到了 Mongoose 提供的 [预保存钩子](https://mongoosejs.com/docs/middleware.html#pre)
- 为方便校验密码，在模型上还添加了一个[实例方法](https://mongoosejs.com/docs/guide.html#methods)。

### 定义 GraphQL 模式

本文用 [Apollo](https://www.apollographql.com/docs/apollo-server/) 来构建后端服务器。

运行以下命令来安装 Apollo 服务器及其依赖项：

``` shell
pnpm add apollo-server-express apollo-server-core express graphql
```

编写 GraphQL 类型定义，用以描述查询（Query）和变更（Mutation）。

创建 `src/schemas/index.js` 文件并添加以下代码：

``` js
import { gql } from 'apollo-server-express'

const typeDefs = gql`
  scalar DateTime # 标量类型
  type Query {
    # Auth
    refreshAccessToken: TokenResponse!
    logoutUser: Boolean!

    # User
    getMe: UserResponse!
  }

  type Mutation {
    # Auth
    loginUser(input: LoginInput!): TokenResponse!
    signupUser(input: SignUpInput!): UserResponse!
  }

  input SignUpInput {
    name: String!
    email: String!
    password: String!
    passwordConfirm: String!
    photo: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type TokenResponse {
    status: String!
    access_token: String!
  }

  type UserResponse {
    status: String!
    user: UserData!
  }

  type UserData {
    id: ID!
    name: String!
    email: String!
    photo: String!
    role: String!
    createdAt: DateTime
    updatedAt: DateTime
  }
`

export default typeDefs
```

上述代码分解：

- `typeDefs` 变量定义 GraphQL 类型
- 定义[标量类型](https://graphql.cn/learn/schema/#scalar-types) `DateTime`，因为我们将与MongoDB的时间戳一起工作。
- 定义了两个查询^Query^ - `refreshAccessToken`，用以刷新过期访问令牌；`getMe`，获取当前登录用户凭证。
- 定义了两个变更^Mutation^ - `signupUser` 用于注册新用户，`loginUser` 用于登录已注册用户。

## 用 Express 连接 Redis 和 MongoDB

::: tip
确保 Redis 和 MongoDB Docker 容器正在运行。
:::

### 连接到 MongoDB Docker 容器

在 `src` 文件夹中，创建 `utils/connectDB.js` 文件，并添加以下代码：

``` js
// src/utils/connectDB.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const localUri = process.env.MONGODB_URI_LOCAL

async function connectDB() {
  try {
    await mongoose.connect(localUri)
    console.log('数据库已连接')
  }
  catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

export default connectDB
```

### 连接到 Redis Docker 容器

安装 `Redis` 包：

``` shell
pnpm add redis
```

接到Redis容器。创建 `src/utils/connectRedis.js` 文件，并添加以下代码：

``` js
// src/utils/connectRedis.js
import { createClient } from 'redis'

const redisUrl = 'redis://localhost:6379'

const redisClient = createClient({
  url: redisUrl,
})

const connectRedis = async () => {
  try {
    await redisClient.connect()
  }
  catch (error) {
    console.error(error.message)
    setInterval(5000, connectRedis)
  }
}

connectRedis()

redisClient.on('connect', () =>
  console.log('Redis 已连接')
)

redisClient.on('error', err => console.error(err))

export default redisClient
```

## 处理报错

设计 API 时，建议返回正确的 HTTP 状态码，以告知客户端在服务器上发生了什么。

Apollo 服务器为提供了一个错误类，可以利用其向客户端发送错误信息。

下面的代码中，捕获 Mongoose 错误，并向客户端返回。

``` js
import { ApolloError } from 'apollo-server-core'

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`
  throw new ApolloError(message, 'GRAPHQL_VALIDATION_FAILED')
}

const handleValidationError = (error) => {
  const message = Object.values(error.errors).map(el => el.message)
  throw new ApolloError(
    `Invalid input: ${message.join(', ')}`,
    'GRAPHQL_VALIDATION_FAILED'
  )
}

const errorHandler = (err) => {
  if (err.name === 'CastError')
    handleCastError(err)
  if (err.name === 'ValidationError')
    handleValidationError(err)
  throw err
}

export default errorHandler
```

## 签署、验证 JSON Web Token

JSON Web Token 用于跨域认证，十分流行。JWT 只有在过期时才失效，这有可能被黑客利用，但瑕不掩瑜。

本文使用 Redis 来存储用户会话，以给 JWt 增加一个额外的安全层。

运行以下命令来安装 JSON Web Token 包：

``` shell
pnpm add jsonwebtoken
```

将刷新令牌、访问令牌存储于 HTTPOnly cookies 中，以提高安全级别。此举可防止其被攻击者用 Javascript 获取。

### 生成公私钥

在上文提到的 `.env` 文件中提供了一对密钥，但你可以自己生成：

**第一步**：导航到[这个网站](http://travistidwell.com/jsencrypt/demo/)，点击蓝色的 `"生成密钥"` 按钮。

**第二步**：接下来，访问[这个网站](https://www.base64encode.org/)，将私钥和公钥编码为 **Base64**。

::: tip
将密钥编码为 Base64，以避免在构建 Docker 容器时报警。
:::

**第三步**：更新密钥至 `.env` 文件。

::: tip
刷新令牌^Refresh Token^ 亦如上述步骤。
:::

接着，创建两个函数来签署和校验令牌。

俩函数中，应先将密钥解码，而后传给 JSONWebToken 方法。

``` js
// src/utils/jwt.js
import jwt from 'jsonwebtoken'
import errorHandler from '../controllers/error.controller.js'

export const signJwt = (payload, Key, options) => {
  const privateKey = Buffer.from(process.env[Key], 'base64').toString('ascii')
  return jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: 'RS256',
  })
}

export const verifyJwt = (token, Key) => {
  try {
    const publicKey = Buffer.from(process.env[Key], 'base64').toString('ascii')
    const decoded = jwt.verify(token, publicKey)
    return decoded
  }
  catch (error) {
    errorHandler(error)
  }
}
```


## 创建认证控制器^Authentication Controller^

认证控制器，负责注册，刷新访问令牌，登录，发送验证邮件，以及注销。

为访问令牌和刷新令牌定义 cookie 选项：

``` js
// src/controllers/auth.controller.js
import config from 'config'
const accessTokenExpireIn = config.get('jwtAccessTokenExpiresIn')
const refreshTokenExpireIn = config.get('jwtRefreshTokenExpiresIn')

const cookieOptions = {
  httpOnly: true,
  // domain: 'localhost',
  sameSite: 'none',
  secure: true,
}

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: accessTokenExpireIn * 60 * 1000,
  expires: new Date(Date.now() + accessTokenExpireIn * 60 * 1000),
}

const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: refreshTokenExpireIn * 60 * 1000,
  expires: new Date(Date.now() + refreshTokenExpireIn * 60 * 1000),
}

if (process.env.NODE_ENV === 'production')
  cookieOptions.secure = true
```

### 注册用户控制器

由于 MongoDB 区分大小写，`Johndoe@gmail.com` 和 `johndoe@gmail.com`，MongoDB 认为这是两个邮箱，故而在定义用户模型时，需给邮箱字段转小写。

另外，MongoDB 返回错误代码 `11000`，表明文档中某个**唯一索引**^unique^重复。

本例中邮箱字段为唯一索引。

``` js
// src/controllers/auth.controller.js
import { AuthenticationError, ForbiddenError } from 'apollo-server-core'
import config from 'config'
import userModel from '../models/user.model.js'
import redisClient from '../utils/connectRedis.js'
import { signJwt, verifyJwt } from '../utils/jwt.js'
import errorHandler from './error.controller.js'

// ? Cookie Options

// ? 注册
const signup = async (
  parent,
  { input: { name, email, password, passwordConfirm } },
  { req }
) => {
  try {
    const user = await userModel.create({
      name,
      email, // 邮箱唯一
      password,
      passwordConfirm,
    })

    return {
      status: 'success',
      user,
    }
  }
  catch (error) {
    if (error.code === 11000) {
      throw new ForbiddenError('用户已存在')
    }
    errorHandler(error)
  }
}
```

### 登录用户控制器

用户登录后，向客户端返回访问令牌和刷新令牌 cookies。

登录时，需先校验邮箱。

``` js
// src/controllers/auth.controller.js
// ? Cookie Options

// ? SignUp User

// ? Sign Tokens
async function signTokens(user) {
  // 创建 session
  await redisClient.set(user.id, JSON.stringify(user), {
    EX: 60 * 60,
  })

  // 生成访问令牌
  const access_token = signJwt({ user: user.id }, 'JWT_ACCESS_PRIVATE_KEY', {
    expiresIn: `${config.get('jwtAccessTokenExpiresIn')}m`,
  })

  // 生成刷新令牌
  const refresh_token = signJwt({ user: user.id }, 'JWT_REFRESH_PRIVATE_KEY', {
    expiresIn: `${config.get('jwtRefreshTokenExpiresIn')}m`,
  })

  return { access_token, refresh_token }
}

const login = async (parent, { input: { email, password } }, { req, res }) => {
  try {
    // 检查用户是否存在，密码是否正确
    const user = await userModel
      .findOne({ email })
      .select('+password +verified') // 明确要这俩字段

    if (!user || !(await user.comparePasswords(password, user.password))) {
      throw new AuthenticationError('邮箱或密码错误')
    }

    user.password = undefined

    // 生成 session 和 token
    const { access_token, refresh_token } = await signTokens(user)

    // 将刷新令牌添加到 cookie
    res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions)
    res.cookie('access_token', access_token, accessTokenCookieOptions)
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    })

    return {
      status: 'success',
      access_token,
    }
  }
  catch (error) {
    errorHandler(error)
  }
}
```

下面是一些值得注意的事情，你应该考虑上述问题。

- 在定义用户模型时，`password` 和 `verified` 字段设置为默认查询时不返回，所以要获取，必须明确告诉 mongoose。
- 在校验登录密码后，需将密码字段从返回给用户的文档中删除，此处设置为 `undefined`。

### 刷新访问令牌控制器

访问令牌过期后调用此控制器，以返回一个新的访问令牌。

::: tip
只有当用户在 Redis 数据库中有一个有效的会话时，访问令牌才能被刷新。
:::

``` js
// src/controllers/auth.controller.js
// ? Cookie Options

// ? SignUp User

// ? Sign Tokens

// ? Login User

// ? Refresh Tokens
const refreshAccessToken = async (parent, args, { req, res }) => {
  try {
    // 从 cookie 中获取刷新令牌
    const { refresh_token } = req.cookies

    // 解码刷新令牌
    const decoded = verifyJwt(refresh_token, 'JWT_REFRESH_PUBLIC_KEY')

    if (!decoded) {
      throw new ForbiddenError('无法刷新访问令牌')
    }

    // 从 Redis 中获取用户的 session
    const session = await redisClient.get(decoded.user)

    if (!session) {
      throw new ForbiddenError('会话已过期')
    }

    // 检查用户是否存在并且已验证
    const user = await userModel
      .findById(JSON.parse(session)._id)
      .select('+verified')

    if (!user || !user.verified) {
      throw new ForbiddenError('无法刷新访问令牌')
    }

    // 生成新的访问令牌
    const access_token = signJwt({ user: user._id }, 'JWT_ACCESS_PRIVATE_KEY', {
      expiresIn: config.get('jwtAccessTokenExpiresIn'),
    })

    // 将访问令牌添加到 cookie
    res.cookie('access_token', access_token, accessTokenCookieOptions)
    res.cookie('logged_in', 'true', {
      ...accessTokenCookieOptions,
      httpOnly: false,
    })

    return {
      status: 'success',
      access_token,
    }
  }
  catch (error) {
    errorHandler(error)
  }
}
```

### 注销控制器

注销控制器将过期的 cookies 返回给客户。

此外，还需要从 Redis 数据库中删除该用户会话。

``` js
// src/controllers/auth.controller.js
import checkIsLoggedIn from '../middleware/checkIsLoggedIn.js'
// ? Cookie Options

// ? SignUp User

// ? Sign Tokens

// ? Login User

// ? Refresh Tokens

// ? Logout User
const logoutHandler = async (_, args, { req, res, getAuthUser }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser)

    const user = await getAuthUser(req)

    // 从 Redis 中删除用户的 session
    await redisClient.del(user.id)

    // 将过期的 cookies 返回给客户端
    res.cookie('access_token', '', { maxAge: -1 })
    res.cookie('refresh_token', '', { maxAge: -1 })
    res.cookie('logged_in', '', { maxAge: -1 })

    return true
  }
  catch (error) {
    errorHandler(error)
  }
}

export default {
  signup,
  login,
  refreshAccessToken,
  logoutHandler,
}
```

## 创建用户控制器^User Controller^

为了测试认证逻辑，让我们创建一个getMe处理程序来返回当前登录用户的凭证。

``` js
// src/controllers/user.controller.js
import checkIsLoggedIn from '../middleware/checkIsLoggedIn.js'
import errorHandler from './error.controller.js'

const getMe = async (_, args, { req, getAuthUser }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser)

    const user = await getAuthUser(req)

    return {
      status: 'success',
      user,
    }
  }
  catch (error) {
    errorHandler(error)
  }
}

export default {
  getMe,
}
```

## 定义认证中间件^Authentication Middleware^

使用 [`cookie-parser`](https://www.npmjs.com/package/cookie-parser) 包，来解析请求头中的 cookies。

``` shell
pnpm add cookie-parser
```

### 反序列化用户中间件

现在让我们创建一个中间件，作为所有受保护资源的保护者。

``` js
// src/middleware/authUser.js
import { ForbiddenError } from 'apollo-server-core'
import errorHandler from '../controllers/error.controller.js'
import userModel from '../models/user.model.js'
import redisClient from '../utils/connectRedis.js'
import { verifyJwt } from '../utils/jwt.js'

const authUser = async (req) => {
  try {
    // 从请求头中获取访问令牌
    let access_token
    if (
      req.headers.authorization
      && req.headers.authorization.startsWith('Bearer')
    ) {
      access_token = req.headers.authorization.split(' ')[1]
    }
    else if (req.cookies.access_token) {
      const { access_token: token } = req.cookies
      access_token = token
    }

    if (!access_token)
      return false

    // 解码访问令牌
    const decoded = verifyJwt(access_token, 'JWT_ACCESS_PUBLIC_KEY')

    if (!decoded)
      return false

    // 检查会话是否有效
    const session = await redisClient.get(decoded.user)

    if (!session) {
      throw new ForbiddenError('会话已过期')
    }

    // 检查用户是否存在并且已验证
    const user = await userModel
      .findById(JSON.parse(session).id)
      .select('+verified')

    if (!user || !user.verified) {
      throw new ForbiddenError(
        '无法访问此资源，请先登录'
      )
    }

    return user
  }
  catch (error) {
    errorHandler(error)
  }
}

export default authUser
```

下面是上述代码的摘要：

- 从请求头 或 req.cookies 对象中获取访问令牌
- 验证访问令牌，提取其中存储的有效载荷。
- 检查用户是否有一个有效的会话并仍然存在于MongoDB数据库中。
- 如果没有任何错误，将用户返回到下一个中间件。

*** 登录检查

接下来，创建登录检查中间件。

``` js
// src/middleware/checkIsLoggedIn.js
import { AuthenticationError } from 'apollo-server-core'
import errorHandler from '../controllers/error.controller.js'

const checkIsLoggedIn = async (req, getAuthUser) => {
  try {
    // 检查用户是否已登录
    const authUser = await getAuthUser(req)

    if (!authUser) {
      throw new AuthenticationError('未登录')
    }
  }
  catch (error) {
    errorHandler(error)
  }
}

export default checkIsLoggedIn
```

## 创建解析器

截止目前，逻辑已实现九成，下来定义 GraphQL 解析器。

### 定义一个标量DateTime

下面的 [GraphQLScalarType](https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/) 对象
指定了一个代表日期的自定义标量的交互方式。它假定后端用Date JavaScript对象表示日期。

``` js
// src/resolvers/datetime.js
import { GraphQLScalarType, Kind } from 'graphql'

export default new GraphQLScalarType({
  name: 'DateTime',
  description: '标量类型 DateTime',

  serialize(value) {
    return new Date(value).toISOString()
  },
  parseValue(value) {
    return new Date(value)
  },
  parseLiteral(ast) {
    if (ast.Kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10))
    }
    return null
  },
})
```

### 创建查询解析器

``` js
// src/resolvers/query.resolver.js
import authController from '../controllers/auth.controller.js'
import userController from '../controllers/user.controller.js'

export default {
  // Users
  getMe: userController.getMe,
  // Auth
  refreshAccessToken: authController.refreshAccessToken,
  logoutUser: authController.logoutHandler,
}
```

### 创建变更解析器

``` js
// src/resolvers/mutation.resolver.js
import authController from '../controllers/auth.controller.js'

export default {
  // Auth
  signupUser: authController.signup,
  loginUser: authController.login,
}
```

### 导出解析器

``` js
// src/resolvers/index.js
import Mutation from './mutation.resolver.js'
import Query from './query.resolver.js'

export { Mutation, Query }
```

## 配置 Apollo 服务器

下一步，连接模式^Schema^和解析器^Resolver^。

创建 `src/app.js` 文件并添加以下代码：

``` js
// src/app.js
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import validateEnv from './utils/validateEnv.js'
dotenv.config()
validateEnv()

const app = express()

// 中间件
app.use(cookieParser())

process.on('uncaughtException', (err) => {
  console.error('异常，未捕获。关闭服务...')
  console.error('错误?', err.message)
  process.exit(1)
})

export default app
```

运行以下命令来安装 `cors` 和 `nodemon`。

`cors` 包解决跨域问题。

`nodemon` 包用于热重载服务器。

``` shell
pnpm add cors nodemon -D
```

``` js
// src/server.js
import http from 'node:http'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import config from 'config'
import cors from 'cors'
import connectDB from './utils/connectDB.js'
import typeDefs from './schemas/index.js'
import app from './app.js'
import { Mutation, Query } from './resolvers/index.js'
import DateTime from './resolvers/datetime.js'
import getAuthUser from './middleware/authUser.js'

const httpServer = http.createServer(app)

const corsOptions = {
  origin: ['https://studio.apollographql.com', 'http://localhost:8000'],
  credentials: true,
}

app.use(cors(corsOptions))

const resolvers = {
  DateTime,
  Query,
  Mutation,
};

(async function () {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req, res }) => ({ req, res, getAuthUser }),
  })

  // 连接数据库
  await connectDB()

  // 启动 Apollo 服务器
  await server.start()

  server.applyMiddleware({ app, cors: corsOptions })

  const port = config.get('port')

  await new Promise(resolve => httpServer.listen(port, '0.0.0.0', resolve))
  console.log(
    `服务器启动于 http://localhost:${port}${server.graphqlPath}`
  )
})()

process.on('unhandledRejection', (err) => {
  console.log('异常，未捕获。关闭服务..')
  console.error('错误', err.message)

  httpServer.close(async () => {
    process.exit(1)
  })
})
```

::: tip
确保在 `package.json` 文件中把属性 `type` 设置为 `module`。
:::

运行此命令来启动 Apollo 服务器：

``` shell
nodemon ./src/server.js
```

## 结尾

至此，代码完成
