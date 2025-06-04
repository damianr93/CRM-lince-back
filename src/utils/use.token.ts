import { AuthTokenResult, IUseToken } from "src/modules/auth/interface/auth.interface";
import * as jwt from 'jsonwebtoken'

export const useToken = (token:string): IUseToken | string => {
    try {

        const decode = jwt.decode(token) as AuthTokenResult | any

        const currentDate = new Date()
        const expiresDate = new Date(decode.exp)
        
        return {
            sub: decode.sub,
            role: decode.role,
            isExpires: +expiresDate <= +currentDate / 1000
        }   
    } catch (error) {
        return 'Token is invalid'
    }
}