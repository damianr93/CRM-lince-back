import { ApiProperty } from "@nestjs/swagger";

export class authDto {

    @ApiProperty({
        description: 'username del usuario',
        example: 'eljuanchodelpueblo01'
    })
    username:string;

    @ApiProperty({
        description: 'password del usuario',
        example: '123456',
        minLength: 6,
        maxLength: 20
    })
    password:string;
}