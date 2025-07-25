import { Model } from 'mongoose';

import {
    ADMIN_MODEL_NAME, CHAT_MODEL_NAME, CUSTOMER_MODEL_NAME, MESSAGE_MODEL_NAME, PROVIDER_MODEL_NAME
} from '@/core/constants/model.constant';
import {
    ADMIN_REPOSITORY_INTERFACE_NAME, CHAT_REPOSITORY_INTERFACE_NAME,
    CUSTOMER_REPOSITORY_INTERFACE_NAME, MESSAGE_REPOSITORY_INTERFACE_NAME,
    PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@/core/constants/repository.constant';
import { AdminRepository } from '@/core/repositories/implementations/admin.repository';
import { ChatRepository } from '@/core/repositories/implementations/chat.repository';
import { CustomerRepository } from '@/core/repositories/implementations/customer.repository';
import { MessageRepository } from '@/core/repositories/implementations/message.repository';
import { ProviderRepository } from '@/core/repositories/implementations/provider.repository';
import { AdminDocument } from '@/core/schema/admin.schema';
import { ChatDocument } from '@/core/schema/chat.schema';
import { CustomerDocument } from '@/core/schema/customer.schema';
import { MessageDocument } from '@/core/schema/message.schema';
import { ProviderDocument } from '@/core/schema/provider.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

export const socketRepositoryProviders: Provider[] = [
    {
        provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
        useFactory: (customerModel: Model<CustomerDocument>) =>
            new CustomerRepository(customerModel),
        inject: [getModelToken(CUSTOMER_MODEL_NAME)]
    },
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel: Model<ProviderDocument>) =>
            new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)]
    },
    {
        provide: ADMIN_REPOSITORY_INTERFACE_NAME,
        useFactory: (adminModel: Model<AdminDocument>) =>
            new AdminRepository(adminModel),
        inject: [getModelToken(ADMIN_MODEL_NAME)]
    },
    {
        provide: CHAT_REPOSITORY_INTERFACE_NAME,
        useFactory: (chatModel: Model<ChatDocument>) =>
            new ChatRepository(chatModel),
        inject: [getModelToken(CHAT_MODEL_NAME)]
    },
    {
        provide: MESSAGE_REPOSITORY_INTERFACE_NAME,
        useFactory: (messageModel: Model<MessageDocument>) =>
            new MessageRepository(messageModel),
        inject: [getModelToken(MESSAGE_MODEL_NAME)]
    }
];