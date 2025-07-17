import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSchema } from './schemas/users.schema';
import { Bcrypt } from './utils/bcrypt';
import { UsersRepository } from './users.repository';
import { CustomDomainException } from '../../../setup/exceptions/custom-domain.exception';
import { User } from './entitys/users.entity';
import { UsersTormRepository } from '../typeOrmRepository/users-torm.repository';


@Injectable()
export class UsersService {
  constructor(
    private usersTormRepository: UsersTormRepository,
    private usersRepository:UsersRepository
  ) {}


  async create(createUserDto: CreateUserDto, emailConfirmation?: any){
    const userLogin = await this.usersRepository.findByLogin(createUserDto.login);
    const userEmail = await this.usersRepository.findByEmail(createUserDto.email);
    
    const errors = [{
      message: `User with ${userLogin.length > 0 ? 'login' : userEmail.length > 0 ? 'email' : null} == ${userLogin ? createUserDto.login : userEmail ? createUserDto.email : null} already exists`,
      field: `${userLogin.length > 0 ? 'login' : userEmail.length > 0 ? 'email' : null}`
    }]
    if (userLogin.length !== 0 || userEmail.length !== 0) {
      throw new CustomDomainException({
        errorsMessages: [...errors]
      });
    }

    const passwordHash = await Bcrypt.generateHash(createUserDto.password);   
    // const user = UserSchema.createInstance(
    //   {
    //     email: createUserDto.email,
    //     login: createUserDto.login,
    //     password: passwordHash,
    //   },
    // );

    // Type ORM
      const user = User.createInstance(
      {
        email: createUserDto.email,
        login: createUserDto.login,
        password: passwordHash,
      },
    );
    const createdUser = await this.usersTormRepository.create(user, emailConfirmation)   

    return createdUser;
  }

 async remove(id: number) {
    return await this.usersRepository.delete(id);
  }
}
