import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class CreateUserDto {

    @ApiProperty({
        example: 'Angel Damian',
        description: 'username of the user',
        maxLength: 15,
        minLength: 4,
    })
    @IsString({ message: 'The username of the user must be string' })
    @IsNotEmpty({ message: 'The username of the user is requires' })
    @MaxLength(15, {message:'username must be less than 15 characters'})
    @MinLength(4, {message:'username must be mora than 4 characters'})
    username: string


    @ApiProperty({
        example: 'admin',
        description: 'role of the user',
    })
    @IsString({ message: 'The role of the user must be string' })   
    @IsNotEmpty({ message: 'The role of the user is requires' })
    @IsEnum(['ADMIN', 'USER'], {message:'role must be one of the following values: admin, user'})
    role: string
    
    @ApiProperty({
        example: '0303456',
        description: 'password of the user',
        maxLength: 50,
        minLength: 6,
    })
    @IsString({ message: 'The password of the user must be string' })
    @IsNotEmpty({ message: 'The password of the user is requires' })
    @MaxLength(15, {message:'password must be less than 15 characters'})
    @MinLength(6, {message:'password must be mora than 6 characters'})
    password: string
}
