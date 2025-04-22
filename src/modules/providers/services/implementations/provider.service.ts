import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProviderServices } from '../interfaces/provider-service.interface';
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from '../../../../core/constants/repository.constant';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import { Provider } from '../../../../core/entities/implementation/provider.entity';
import { IPayload } from '../../../auth/misc/payload.interface';
import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { CloudinaryService } from '../../../../configs/cloudinary/cloudinary.service';

@Injectable()
export class ProviderServices implements IProviderServices {
  constructor(
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private providerRepository: IProviderRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getProviders(): Promise<Provider[]> {
    return await this.providerRepository.find();
  }

  async fetchOneProvider(user: IPayload): Promise<IProvider> {
    const result = await this.providerRepository.findOne({ _id: user.sub });
    if (!result) {
      throw new NotFoundException(`No provider found for user ID: ${user.sub}`);
    }
    return result;
  }

  async updateProvider(
    user: IPayload,
    updateData: Partial<IProvider>,
    file: Express.Multer.File,
  ): Promise<Provider> {
    const avatarUrl = await this.cloudinaryService.uploadImage(file);

    if (!avatarUrl) {
      throw new NotFoundException(
        'Avatar not updated to cloudinary successfully',
      );
    }

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    const updatedProvider = await this.providerRepository.findOneAndUpdate(
      { _id: user.sub },
      {
        $set: {
          ...sanitizedUpdate,
          avatar: avatarUrl?.url || '',
        },
      },
      { new: true },
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with ID ${user.sub} not found`);
    }

    return updatedProvider;
  }
}
