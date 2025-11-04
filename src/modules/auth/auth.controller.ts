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
    ) {
        const user = await this.authService.validateUser(username, password);

        const token = await this.authService.signToken({
            sub: user.id,
            username: user.username,
            role: user.role,
        });

        const plainUser = (typeof user.toObject === 'function' ? user.toObject() : user) as Record<string, any>;
        const plainId = plainUser?.id;
        const plainObjectId = plainUser?._id;
        const resolvedId =
            (typeof user.id === 'string' && user.id) ||
            plainId ||
            (plainObjectId && typeof plainObjectId.toString === 'function'
                ? plainObjectId.toString()
                : plainObjectId);
        const resolvedUsername = plainUser?.username ?? user.username;
        const resolvedRole = plainUser?.role ?? user.role;

        return {
            token,
            user: {
                id: resolvedId,
                username: resolvedUsername,
                role: resolvedRole,
            },
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
