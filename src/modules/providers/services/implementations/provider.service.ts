import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProviderServices } from '../interfaces/provider-service.interface';
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from '../../../../core/constants/repository.constant';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import { Provider } from '../../../../core/entities/implementation/provider.entity';
import { IPayload } from '../../../../core/misc/payload.interface';
import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { CloudinaryService } from '../../../../configs/cloudinary/cloudinary.service';
import { UpdateDefaultSlotsDto } from '../../dtos/provider.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProviderServices implements IProviderServices {
  constructor(
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private providerRepository: IProviderRepository,
    private cloudinaryService: CloudinaryService,
  ) { }

  async getProviders(): Promise<Provider[]> {
    return await this.providerRepository.find();
  }

  async fetchOneProvider(id: string): Promise<IProvider> {
    const result = await this.providerRepository.findOne({ _id: id });

    if (!result) {
      throw new NotFoundException(`No provider found for user ID: ${id}`);
    }
    return result;
  }

  async updateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<Provider> {

    if (file) {
      const response = await this.cloudinaryService.uploadImage(file);

      if (!response) {
        throw new NotFoundException(
          'Avatar not updated to cloudinary successfully',
        );
      }
      updateData.avatar = response.url;
    }

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    const updatedProvider = await this.providerRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        $set: sanitizedUpdate,
      },
      { new: true },
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return updatedProvider;
  }

  async updateDefaultSlot(slot: UpdateDefaultSlotsDto, id: string): Promise<IProvider> {
    if (!id) {
      throw new BadRequestException(`Provider with ID ${id} not found`);
    }

    const updatedProvider = await this.providerRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $push: { defaultSlots: slot } },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with ID ${id} not updated`);
    }

    return updatedProvider;
  }

  async deleteDefaultSlot(id: string) {
    if (!id) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    const hasDeleted = await this.providerRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        $set: { defaultSlots: [] }
      }
    );

    if (!hasDeleted) {
      throw new Error('Failed to delete default slots');
    }
  }
}
