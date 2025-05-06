import { Inject, Injectable, Logger } from '@nestjs/common';
import { SERVICE_OFFERED_REPOSITORY_NAME } from '../../../../core/constants/repository.constant';
import { IServiceOfferedRepository } from '../../../../core/repositories/interfaces/serviceOffered-repo.interface';
import { IBookingService } from '../interfaces/booking-service.interface';
import { SelectedServiceDto, IPriceBreakupData } from '../../dtos/booking.dto';


@Injectable()
export class BookingService implements IBookingService {
    private logger = new Logger(BookingService.name);

    constructor(
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private _serviceOfferedRepository: IServiceOfferedRepository,
    ) { }



    /**
     * Calculates the detailed price breakup for a list of selected services and subServices.
     *
     * This method performs the following:
     * - Retrieves services by IDs from the database.
     * - Filters each service’s subServices based on the user’s selected subservice IDs.
     * - Computes the subtotal from the matched subServices' prices.
     * - Adds a fixed visiting fee and applies an 18% tax rate.
     *
     * @param {SelectedServiceDto[]} dto - Array of user-selected service and subservice identifiers.
     * @returns {Promise<IPriceBreakupData>} An object containing subtotal, tax, visiting fee, and total amount.
     *
     * @throws {Error} If:
     * - The `dto` array is empty or undefined.
     * - A service is not found for a given service ID.
     * - Any subservice contains a non-numeric or invalid price.
     *
     * */
    async preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupData> {
        if (!dto || dto.length === 0) {
            throw new Error('No services selected for price calculation.');
        }

        // Fetch all selected services from the repository
        let services = await Promise.all(
            dto.map(item => this._serviceOfferedRepository.findOne({ _id: item.serviceId }))
        );

        // Filter each service's subServices to include only the ones selected by the user
        const filteredServices = services.map((service, index) => {
            const selectedSubServiceIds = dto[index].subServiceIds;

            // Filter subServices by the selected subservice IDs
            const matchedSubServices = service?.subService.filter(sub =>
                selectedSubServiceIds.includes(sub.id as string)
            );

            return {
                ...service,
                subService: matchedSubServices
            };
        });

        let subTotal = 0;
        filteredServices.forEach(service => {
            (service.subService ?? []).forEach(sub => {
                const price = Number(sub.price);
                if (isNaN(price)) {
                    throw new Error(`Invalid price in subservice: ${sub.title || 'Unnamed SubService'}`);
                }
                subTotal += price;
            });
        })

        const visitingFee = 50;
        const taxRate = 0.18;
        const tax = parseFloat((subTotal * taxRate).toFixed(2));
        const total = subTotal + visitingFee + tax;

        return {
            subTotal,
            tax,
            visitingFee,
            total,
        };
    }
}
