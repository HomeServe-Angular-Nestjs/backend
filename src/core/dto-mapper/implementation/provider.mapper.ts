import { IProviderMapper } from "@core/dto-mapper/interface/provider.mapper.interface";
import { Provider } from "@core/entities/implementation/provider.entity";
import { IProvider } from "@core/entities/interfaces/user.entity.interface";
import { ProviderDocument } from "@core/schema/provider.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ProviderMapper implements IProviderMapper {
    toEntity(doc: ProviderDocument): IProvider {
        return new Provider({
            id: (doc._id as Types.ObjectId).toString(),
            email: doc.email,
            username: doc.username,
            password: doc.password,
            googleId: doc.googleId,
            additionalSkills: doc.additionalSkills ?? [],
            avatar: doc.avatar || '',
            awards: doc.awards ?? [],
            bio: doc.bio || '',
            expertise: doc.expertise ?? [],
            fullname: doc.fullname || '',
            languages: doc.languages ?? [],
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            isDeleted: doc.isDeleted,
            verificationStatus: doc.verificationStatus,
            isCertified: doc.isCertified,
            servicesOffered: doc.servicesOffered.map((id: Types.ObjectId) =>
                id.toString(),
            ),
            availability: doc.availability,
            experience: doc.experience,
            serviceRadius: doc.serviceRadius,
            profession: doc.profession,
            defaultSlots: doc.defaultSlots,
            schedules: doc.schedules.map(id => id.toString()),
            location: doc.location,
            address: doc.address,
            bookingLimit: doc.bookingLimit,
            bufferTime: doc.bufferTime,
            enableSR: doc.enableSR,
            docs: (doc.docs ?? []).map(d => ({
                id: (doc._id as Types.ObjectId).toString(),
                fileUrl: d.fileUrl,
                isDeleted: d.isDeleted,
                label: d.label,
                uploadedAt: d.uploadedAt,
                verificationStatus: d.verificationStatus,
                verifiedAt: d.verifiedAt
            })),
            ratingCount: doc.ratingCount,
            avgRating: doc.avgRating,
            reviews: doc.reviews,
            workImages: doc.workImages,
        });
    }

    toDocument(entity: Partial<IProvider>): Partial<ProviderDocument> {
        return {
            email: entity.email,
            username: entity.username,
            googleId: entity.googleId,
            avatar: entity.avatar,
            isActive: true,
            lastLogin: new Date(),
        }
    }
}