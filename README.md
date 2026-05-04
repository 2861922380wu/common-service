# Common Service

NestJS 通用公共服务项目

## 功能特性

- 七牛云文件上传服务
- 获取上传凭证
- 上传本地文件/Buffer
- 删除文件
- 获取文件信息

## 安全特性

- JWT 身份认证（与管理后台共用同一 secret）
- 请求速率限制（每分钟 60 次）
- Helmet 安全头防护
- CORS 跨域支持

## 安装依赖

```bash
npm install
```

## 配置环境变量

项目支持多环境配置：

- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env` - 基础配置（优先级低于环境特定配置）

根据当前环境复制对应的 `.env.xxx` 文件并填写配置：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# JWT 配置（与管理后台使用相同的 secret）
# 注意：JWT Secret 至少需要 32 个字符
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long

# 七牛云配置
QINIU_ACCESS_KEY=your_access_key
QINIU_SECRET_KEY=your_secret_key
QINIU_BUCKET=your_bucket_name
QINIU_DOMAIN=https://your-domain.com
```

**环境验证**：

项目会自动验证所有必需的环境变量是否正确配置，包括：
- `JWT_SECRET` 必须至少 32 个字符
- `QINIU_*` 配置必须完整
- `NODE_ENV` 必须是 `development` 或 `production`

## 运行项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## API 接口

**注意：** 所有接口都需要在请求头中携带有效的 JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

### 获取上传凭证

```
POST /qiniu/upload-token
Content-Type: application/json

{
  "bucket": "your-bucket",
  "key": "file-key",
  "expires": 3600
}
```

### 上传文件

```
POST /qiniu/upload
Content-Type: multipart/form-data

file: [binary file]
key: file-key (optional)
bucket: your-bucket (optional)
```

### 删除文件

```
DELETE /qiniu/files/:key
Content-Type: application/json

{
  "bucket": "your-bucket"
}
```

### 获取文件信息

```
GET /qiniu/files/:key?bucket=your-bucket
```

## 项目结构

```
common-service/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── app.module.ts           # 主模块
│   ├── auth/                   # 认证模块
│   │   ├── auth.module.ts
│   │   └── jwt.strategy.ts
│   ├── decorator/              # 装饰器
│   │   └── public.decorator.ts
│   ├── guard/                  # 守卫
│   │   └── jwt.guard.ts
│   └── qiniu/                  # 七牛云模块
│       ├── qiniu.module.ts
│       ├── qiniu.service.ts
│       ├── qiniu.controller.ts
│       └── dto/
│           └── upload.dto.ts
├── test/                       # 测试文件
├── .env.example                # 环境变量示例
├── package.json
├── tsconfig.json
└── nest-cli.json
```
