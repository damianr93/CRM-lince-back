import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorators';
import { AuthGuard } from './auth.guard';
import { envs } from 'src/config/envs';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    async login(
        @Body() { username, password }: { username: string; password: string },
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        const user = await this.authService.validateUser(username, password);

        const token = await this.authService.signToken({
            sub: user.id,
            username: user.username,
            role: user.role,
        });

        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = req.secure || req.get('X-Forwarded-Proto') === 'https';
        const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction && isSecure, 
            sameSite: (isProduction && !isLocalhost) ? 'none' as const : 'lax' as const,
            maxAge: 24 * 60 * 60 * 1000, 
            path: '/', 
        };

        res.cookie('Authentication', token, cookieOptions);

        return {
            ...user,
            ...(process.env.NODE_ENV === 'development' && { token })
        };
    }

    @Public()
    @Post('logout')
    @HttpCode(200)
    logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {

        const isProduction = process.env.NODE_ENV === 'production';
        const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

        res.clearCookie('Authentication', {
            httpOnly: true,
            secure: isProduction,
            sameSite: (isProduction && !isLocalhost) ? 'none' : 'lax',
            path: '/',
        });
        return { success: true };
    }

    @UseGuards(AuthGuard)
    @Get('check')
    @HttpCode(200)
    checkAuth(@Req() req: Request & { user?: any }) {
        return {
            userId: req.user.sub,
            username: req.user.username,
            role: req.user.role,
        };
    }

    @Public()
    @Get('cookie-test')
    @HttpCode(200)
    cookieTest(@Req() req: Request) {
        return {
            hasCookie: !!req.cookies?.Authentication,
            userAgent: req.get('User-Agent'),
            secure: req.secure,
            protocol: req.protocol,
            headers: {
                frontendUrl: envs.FRONTEND_URL,
                currentOrigin: req.get('Origin'),
            }
        };
    }
}