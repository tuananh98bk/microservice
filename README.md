# base-api

node 12.19.0
mysql 8.0

# Setup environment

1. Install Nodejs _[here](https://nodejs.org/en/download/)_
2. Install Docker _[here](https://docs.docker.com/get-docker/)_ (or install MySQL(8+) _[here](https://www.mysql.com/downloads/)_)
3. Via docker, run: `docker-compose up -d`

# Run project

1. Create example database

```sql
-- Create example database
CREATE DATABASE baseapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Insert user admin. password: truong12345
INSERT INTO baseapi.`user` (username,password,full_name,email,mobile,status,role_id)
VALUES('admin','$2a$10$rxeRaHhOpQBsgjPh.ajbX.nkC3H9caOIJbCR/PqowDzrW6pveOeyC','Nguyễn Duy Trường','truongezgg@gmail.com','0335309793',1,1);
```

Create .env
`touch .env`

```bash
# Node timezone(UTC)
TZ=Z
# Server environment
ENVIRONMENT=development

# Servre port
SERVER_PORT=3000

# Database info
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=Amela@123a@
DB_NAME=baseapi

# Auth keys
ACCESS_TOKEN_SECRET=c42ce00cc7ec9ad65b1232145fca2092
REFRESH_TOKEN_SECRET=8c7c24f05f8c7c353bbc56f6f3fd12a0

CMS_ACCESS_TOKEN_SECRET=c42ce00cc7ec9ad65b1124531fca2092
CMS_REFRESH_TOKEN_SECRET=8c7c2asd238c7c353bbc56f6f3fd12a0

SALT_ROUNDS=10
ACCESS_TOKEN_EXPIRE=86400000
REFRESH_TOKEN_EXPIRE=864000000
```

2. Install node modules & run express server.

```
1. npm install
2. npm start
```

3. Import Postman collection & environment

Import collection https://www.getpostman.com/collections/72ef8dac6a5740a92b27

```json
# File environment
{
	"id": "d8d2ea48-14a3-4941-b2fa-a70f4e2852e2",
	"name": "Base environment",
	"values": [
		{
			"key": "host",
			"value": "http://localhost:3000",
			"enabled": true
		},
		{
			"key": "token",
			"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJwZXJtaXNzaW9ucyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0XSwiaWF0IjoxNTg3NTE3NzQ5LCJleHAiOjE1ODc1MTg5NDl9.T3DRcKAv-DsUQvczJ6y9SxwqyjMS8rWLmqC_LlsNdJo",
			"enabled": true
		},
		{
			"key": "refreshToken",
			"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJwZXJtaXNzaW9ucyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0XSwiaWF0IjoxNTg3NTE3NzQ5LCJleHAiOjc4OTQ3MTc3NDl9.bIHv_pipDTkjCODUNw8JEfM_m8EwJ0G2Wqe2eCgPdnQ",
			"enabled": true
		}
	],
	"_postman_variable_scope": "environment",
	"_postman_exported_at": "2020-11-18T15:40:45.382Z",
	"_postman_exported_using": "Postman/7.34.0"
}
```

Test API login in Post man or try this

```
curl --location --request POST 'http://localhost:3000/cms/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "admin",
    "password": "truong12345"
}'
```

# Add more API

1. Create service
   > touch src/app/services/cms.user.ts

```typescript
import User from '$entities/User';
import { getRepository } from 'typeorm';

export async function getUserProfile(userId: number): Promise<User> {
  const userRepository = getRepository(User);

  const user = await userRepository.findOne({
    where: {
      id: userId,
    },
    select: ['id', 'username', 'full_name', 'mobile', 'status', 'email', 'role_id'],
  });

  return user;
}
```

2. Create controller
   > touch src/app/controllers/cms.user.ts

```typescript
import { CMS, Get, Post, Put } from '$helpers/decorator';
import * as service from '$services/cms.user';
import { Request } from 'express';

// Default cms alway start with {host}/cms... change default in src/app/helpers/decorator.ts
// localhost:3000/cms/user
@CMS('/user')
export default class UserController {
  //[GET] http://localhost:3000/cms/user/profile
  @Get('/profile')
  async getUserProfile(req: Request) {
    const userId = req.userId;
    return await service.getUserProfile(userId);
  }
}
```

# Setup server

## Server lightsail Ubuntu 20

> Make swap: https://linuxize.com/post/how-to-add-swap-space-on-ubuntu-20-04

## Enable ssh & add key ssh to server.

- sudo apt-get update -y
- sudo apt-get dist -upgrade -y

- sudo apt install ssh
- sudo systemctl enable --now ssh
- sudo systemctl status ssh

- cd ~/.ssh
- sudo nano authorized_keys (Add ssh key to server)

## Install nodejs & npm

- sudo apt-get install nodejs
- sudo apt-get install npm
- sudo npm install -g n
- `sudo n stable` (node 14) or `sudo n 12.19.0`

## Install nginx

https://www.linode.com/docs/web-servers/nginx/use-nginx-reverse-proxy/

- sudo apt-get update
- sudo apt-get install nginx
- sudo nano /etc/nginx/nginx.conf
- sudo touch /etc/nginx/conf.d/dotachan.conf
- sudo nano /etc/nginx/conf.d/dotachan.conf

```
server {
  listen 80;
  listen [::]:80;

  server_name 13.250.34.2;

  location / {
      proxy_pass http://localhost:3000/;
  }
}
```

- sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled
- sudo nginx -t
- sudo nginx -s reload

### Setting SSL

https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04

- sudo apt-get update
- sudo apt-get install python-certbot-nginx
- sudo certbot --nginx -d dotachan-api.test.amela.vn

Auto renew ssl

- sudo certbot renew --dry-run

##. Install mysql-server

- sudo apt update
- sudo apt install mysql-server
  Setup mysql and create new username: dotachan, password: Amela@123a@
  CREATE USER 'dotachan'@'localhost' IDENTIFIED WITH mysql*native_password BY 'Amela@123a@';
  GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES, RELOAD on *.\_ TO 'dotachan'@'localhost' WITH GRANT OPTION;
  FLUSH PRIVILEGES;

##. Install pm2

- sudo npm install -g pm2
- pm2 start dist/index.js(on dotakyan project)
