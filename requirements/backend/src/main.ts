import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as cookieParser from 'cookie-parser'
import * as serveStatic from 'serve-static';
import * as path from 'path';

class CustomSocketIoAdapter extends IoAdapter {
	createIOServer(port: number, options?: ServerOptions): any {
		const server = super.createIOServer(port, {
			...options,
			cors: {
				origin: `http://${process.env.DOMAIN}:${process.env.CLIENT_PORT}`,
				methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
				allowedHeaders: ["Access-Control-Allow-Origin", "Content-Type", "Accept", "Authorization"],
				credentials: true
			}
		});
		return server;
	}
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({	origin: `http://${process.env.DOMAIN}:${process.env.CLIENT_PORT}`,
  					methods: 'GET, POST, PUT, PATCH, DELETE',
  					allowedHeaders: "Content-Type, Accept, Authorization",
					credentials: true})
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // protect against data not set in the DTO
  app.useWebSocketAdapter(new CustomSocketIoAdapter(app)); 
  app.use(cookieParser());

  const avatarsPath = path.resolve(__dirname, '../avatars');
  app.use('/avatars', serveStatic(avatarsPath, {
    maxAge: '1d',
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
  }));

  await app.listen(5000);

}

bootstrap();
