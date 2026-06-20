import { AuthTokenResult, IUseToken } from "src/modules/auth/interface/auth.interface";
import * as jwt from 'jsonwebtoken'
import { envs } from 'src/config/envs'

export const useToken = (token: string): IUseToken | string => {
    try {
        const decode = jwt.verify(token, envs.JWT_SECTRET) as unknown as AuthTokenResult
        return {
            sub: decode.sub,
            role: decode.role,
            isExpires: false,
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') return 'Token expirado'
        return 'Token inválido'
    }
}