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

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    async login(
        @Body() { username, password }: { username: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(username, password);

        const token = await this.authService.signToken({
            sub: user.id,
            username: user.username,
            role: user.role,
        });

        res.cookie('Authentication', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return { ...user };
    }

    @Public()
    @Post('logout')
    @HttpCode(200)
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('Authentication');
        return { success: true };
    }

    @UseGuards(AuthGuard)
    @Get('check')
    @HttpCode(200)
    checkAuth(@Req() req: Request & { user?: any }) {

        return {
            userId: req.user.sub,
            username: req.user.username,
        };
    }
}
