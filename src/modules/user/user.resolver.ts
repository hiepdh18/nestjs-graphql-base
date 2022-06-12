import { GqlAuthGuard } from './../auth/guards/graphqlAuth.guard';
import { UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { BackendLogger } from 'common/logger/backend-logger';
import { PubSub } from 'graphql-subscriptions';
import { UserCreateDto } from './dtos/userCreate.dto';
import { UserReturnDto } from './dtos/userReturn.dto';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';

const pubSub = new PubSub();

@Resolver(User)
@UseGuards(GqlAuthGuard)
export class UserResolver {
  private logger: BackendLogger = new BackendLogger(UserResolver.name);
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  getAllUsers(): Promise<UserReturnDto[]> {
    return this.userService.findAll();
  }

  // @Query(() => [User])
  // getUserByEmail(@Args('email') email: string): Promise<UserReturnDto> {
  //   return this.userService.findOne(email);
  // }

  @Mutation(() => UserReturnDto)
  createUser(@Args('user') user: UserCreateDto): Promise<UserReturnDto> {
    pubSub.publish('commentAdded', { commentAdded: 'Published!!!' });
    return this.userService.create(user);
  }

  @OnEvent('user.created')
  async testEvent(payload: any) {
    return payload;
  }
  @Subscription(() => String)
  commentAdded() {
    return pubSub.asyncIterator('commentAdded');
  }
}
