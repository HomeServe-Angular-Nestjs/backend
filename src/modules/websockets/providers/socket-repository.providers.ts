import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ADMIN_MODEL_NAME, CHAT_MODEL_NAME, CUSTOMER_MODEL_NAME, MESSAGE_MODEL_NAME, PROVIDER_MODEL_NAME } from "src/core/constants/model.constant";
import { ADMIN_REPOSITORY_INTERFACE_NAME, CHAT_REPOSITORY_INTERFACE_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, MESSAGE_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { AdminRepository } from "src/core/repositories/implementations/admin.repository";
import { ChatRepository } from "src/core/repositories/implementations/chat.repository";
import { CustomerRepository } from "src/core/repositories/implementations/customer.repository";
import { MessageRepository } from "src/core/repositories/implementations/message.repository";
import { ProviderRepository } from "src/core/repositories/implementations/provider.repository";
import { AdminDocument } from "src/core/schema/admin.schema";
import { ChatDocument } from "src/core/schema/chat.schema";
import { CustomerDocument } from "src/core/schema/customer.schema";
import { MessageDocument } from "src/core/schema/message.schema";
import { ProviderDocument } from "src/core/schema/provider.schema";

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