import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SigninDto {
  @ApiProperty({
    description: "E-mail institucional da UTFPR",
    example: "example@alunos.utfpr.edu.br",
  })
  @IsString({ message: "O e-mail precisa ser uma string" })
  @IsNotEmpty({ message: "O e-mail não pode estar vazio" })
  @IsEmail(
    {
      host_whitelist: [/(?:[A-Za-z0-9-]+\.)*utfpr\.edu\.br$/i],
    },
    { message: "E-mail inválido. Use um endereço @utfpr.edu.br." },
  )
  email: string;

  @ApiProperty({
    description: "Senha da conta (mínimo de 6 caracteres)",
    example: "senha123",
    minLength: 6,
  })
  @IsString({ message: "A senha precisa ser uma string" })
  @IsNotEmpty({ message: "A senha não pode estar vazia" })
  @MinLength(6, { message: "A senha precisa ter no mínimo 6 caracteres" })
  password: string;
}
