import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IProviderServices } from '../interfaces/provider-service.interface';
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from '../../../../core/constants/repository.constant';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { CloudinaryService } from '../../../../configs/cloudinary/cloudinary.service';
import { FilterDto, SlotDto, UpdateDefaultSlotsDto } from '../../dtos/provider.dto';

@Injectable()
export class ProviderServices implements IProviderServices {
  private readonly logger = new Logger(ProviderServices.name);

  constructor(
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private _providerRepository: IProviderRepository,
    private _cloudinaryService: CloudinaryService,
  ) { }

  /**
   * Retrieves all providers from the database.
   *
   * @returns {Promise<IProvider[]>} List of all provider documents.
   */
  async getProviders(filter?: FilterDto): Promise<IProvider[]> {
    const query: { [key: string]: any } = { isDeleted: false };

    if (filter?.search) {
      query.email = new RegExp(filter.search, 'i');
    }

    if (filter?.status && filter.status !== 'all') {
      query.isActive = filter.status;
    }

    if (filter?.isCertified) {
      query.isCertified = filter.isCertified
    }

    return await this._providerRepository.find(query);
  }

  /**
   * Fetches a single provider by ID.
   *
   * @param {string} id - The unique identifier of the provider.
   * @returns {Promise<IProvider>} The provider document if found.
   * @throws {NotFoundException} If the provider is not found.
   */
  async fetchOneProvider(id: string): Promise<IProvider> {
    const result = await this._providerRepository.findOne({ _id: id });

    if (!result) {
      throw new NotFoundException(`No provider found for user ID: ${id}`);
    }
    return result;
  }

  /**
   * Performs a full update on the provider's data including avatar upload if a file is provided.
   *
   * @param {string} id - The unique identifier of the provider.
   * @param {Partial<IProvider>} updateData - The data to update the provider with.
   * @param {Express.Multer.File} [file] - Optional avatar image file.
   * @returns {Promise<Provider>} The updated provider document.
   * @throws {NotFoundException} If the provider or avatar upload fails.
   */
  async bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider> {
    if (file) {
      const response = await this._cloudinaryService.uploadImage(file);

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

    const updatedProvider = await this._providerRepository.findOneAndUpdate(
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

  /**
   * Partially updates provider information.
   *
   * @param {string} id - The provider's unique ID.
   * @param {Partial<IProvider>} updateData - The fields to update.
   * @returns {Promise<IProvider>} The updated provider document.
   * @throws {NotFoundException} If the provider is not found.
   */
  async partialUpdate(id: string, updateData: Partial<IProvider>): Promise<IProvider> {
    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }

    return updatedProvider;
  }

  /**
   * Appends a default slot to the provider's schedule.
   *
   * @param {UpdateDefaultSlotsDto} slot - The slot data to be added.
   * @param {string} id - The provider's unique ID.
   * @returns {Promise<IProvider>} The updated provider document.
   * @throws {BadRequestException | NotFoundException} If update fails.
   */
  async updateDefaultSlot(slot: SlotDto, providerId: string): Promise<IProvider> {
    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: providerId },
      { $push: { defaultSlots: slot } },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with ID ${providerId} found`);
    }

    this.logger.debug(updatedProvider);

    return updatedProvider;
  }

  /**
  * Deletes all default slots associated with a provider.
  *
  * @param {string} id - The provider's unique ID.
  * @returns {Promise<void>} Resolves if deletion is successful.
  * @throws {NotFoundException | Error} If provider is not found or update fails.
  */
  async deleteDefaultSlot(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    const hasDeleted = await this._providerRepository.findOneAndUpdate(
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
