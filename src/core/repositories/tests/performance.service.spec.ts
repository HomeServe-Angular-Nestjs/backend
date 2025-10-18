import mongoose, { Model } from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Schema } from "mongoose";
import { BookingRepository } from "@core/repositories/implementations/bookings.repository";
import { IOnTimeArrivalChartData } from "@core/entities/interfaces/user.entity.interface";

const BookingSchema = new Schema({
    providerId: mongoose.Types.ObjectId,
    createdAt: Date,
    respondedAt: Date,
    expectedArrivalTime: Date,
    actualArrivalTime: Date,
    review: {
        rating: Number,
    },
    bookingStatus: String,
});

describe('PerformanceService (Integration Test)', () => {
    let mongoServer: MongoMemoryServer;
    let bookingModel: Model<any>;
    let repository: BookingRepository;
    let providerId: mongoose.Types.ObjectId;
    let otherProviderId: mongoose.Types.ObjectId;

    jest.setTimeout(30000);

    beforeAll(async () => {
        // Create in-memory MongoDB
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        // Define Model and service
        bookingModel = mongoose.model('Booking', BookingSchema);
        repository = new BookingRepository(bookingModel);

        // Create a sample provider ID for consistency
        providerId = new mongoose.Types.ObjectId();
        otherProviderId = new mongoose.Types.ObjectId();
    }, 30000);


    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });


    beforeEach(async () => {
        await bookingModel.deleteMany({});
    });

    // it('Should calculate avg response time correctly', async () => {
    //     // Insert data
    //     await bookingModel.create([
    //         {
    //             providerId,
    //             createdAt: new Date('2025-01-01T10:00:00Z'),
    //             respondedAt: new Date('2025-01-01T10:05:00Z'), // 5 mins response
    //             expectedArrivalTime: new Date('2025-01-01T10:30:00Z'),
    //             actualArrivalTime: new Date('2025-01-01T10:33:00Z'), // 3 mins late → considered on time
    //             review: { rating: 4 },
    //             bookingStatus: 'completed',
    //         },
    //         {
    //             providerId,
    //             createdAt: new Date('2025-01-01T11:00:00Z'),
    //             respondedAt: new Date('2025-01-01T11:10:00Z'), // 10 mins response
    //             expectedArrivalTime: new Date('2025-01-01T11:30:00Z'),
    //             actualArrivalTime: new Date('2025-01-01T11:40:00Z'), // 10 mins late → not on time
    //             review: { rating: 5 },
    //             bookingStatus: 'pending',
    //         },
    //     ]);

    //     const result = await repository.getPerformanceSummary(providerId.toString());
    //     console.log("Result: ", JSON.stringify(result));

    //     // 1️⃣ Avg Response Time: (5 + 10) / 2 = 7.5 mins
    //     expect(result.responseTime.avgResponseTime).toBeCloseTo(7.5, 1);
    //     expect(result.responseTime.responseCount).toBe(2);

    //     // 2️⃣ On-Time Arrival Percentage: 1 on-time out of 2 → 50%
    //     expect(result.onTimeArrival.onTimePercent).toBeCloseTo(50, 0);

    //     // 3️⃣ Average Rating: (4 + 5) / 2 = 4.5
    //     expect(result.avgRating.avgRating).toBeCloseTo(4.5, 1);
    //     expect(result.avgRating.ratingCount).toBe(2);

    //     // 4️⃣ Completion Rate Percentage: 1 completed out of 2 → 50%
    //     expect(result.completionRate.completionRate).toBeCloseTo(50, 0);
    // });

    // it('Should calculate overall growth rate correctly', async () => {
    //     // Insert sample bookings
    //     await bookingModel.create([
    //         // Current month bookings (October)
    //         {
    //             providerId,
    //             bookingStatus: 'completed',
    //             totalAmount: 500,
    //             review: { rating: 4 },
    //             createdAt: new Date('2025-10-05')
    //         },
    //         {
    //             providerId,
    //             bookingStatus: 'completed',
    //             totalAmount: 700,
    //             review: { rating: 5 },
    //             createdAt: new Date('2025-10-06')
    //         },
    //         // Previous month bookings (September)
    //         {
    //             providerId,
    //             bookingStatus: 'completed',
    //             totalAmount: 400,
    //             review: { rating: 4 },
    //             createdAt: new Date('2025-09-10')
    //         },
    //         {
    //             providerId,
    //             bookingStatus: 'completed',
    //             totalAmount: 600,
    //             review: { rating: 3 },
    //             createdAt: new Date('2025-09-12')
    //         },
    //         // Other providers (should not affect this calculation)
    //         {
    //             providerId: otherProviderId,
    //             bookingStatus: 'completed',
    //             totalAmount: 1000,
    //             review: { rating: 4 },
    //             createdAt: new Date('2025-10-05')
    //         },
    //         {
    //             providerId: otherProviderId,
    //             bookingStatus: 'completed',
    //             totalAmount: 800,
    //             review: { rating: 5 },
    //             createdAt: new Date('2025-09-10')
    //         }
    //     ]);

    //     const result = await repository.getProviderGrowthRate(providerId.toString());
    //     console.log("Growth Rate Result:", result);

    //     // Manual calculation:
    //     // Current month totalMetric: 500 + 700 + avgRating(4+5)/2 = 1200 + 4.5 = 1204.5
    //     // Previous month totalMetric: 400 + 600 + avgRating(4+3)/2 = 1000 + 3.5 = 1003.5
    //     // Growth % = ((1204.5 - 1003.5)/1003.5) * 100 ≈ 20%

    //     expect(result[0].growthRate).toBeCloseTo(18, 0);
    // });


    //    it('Should calculate provider monthly trend correctly', async () => {
    //     const otherProviderId = new mongoose.Types.ObjectId();

    //     await bookingModel.create([
    //         // Current month
    //         { providerId, bookingStatus: 'completed', totalAmount: 500, review: { rating: 4 }, createdAt: new Date('2025-10-05'), respondedAt: new Date('2025-10-05T03:05:00Z') },
    //         { providerId, bookingStatus: 'completed', totalAmount: 700, review: { rating: 5 }, createdAt: new Date('2025-10-06'), respondedAt: new Date('2025-10-06T03:15:00Z') },
    //         // Previous month
    //         { providerId, bookingStatus: 'completed', totalAmount: 400, review: { rating: 4 }, createdAt: new Date('2025-09-10'), respondedAt: new Date('2025-09-10T03:10:00Z') },
    //         { providerId, bookingStatus: 'completed', totalAmount: 600, review: { rating: 3 }, createdAt: new Date('2025-09-12'), respondedAt: new Date('2025-09-12T03:20:00Z') },
    //         // Other provider (platform)
    //         { providerId: otherProviderId, bookingStatus: 'completed', totalAmount: 1000, review: { rating: 4 }, createdAt: new Date('2025-10-05'), respondedAt: new Date('2025-10-05T03:10:00Z') },
    //     ]);

    //     const result = await repository.getProviderMonthlyTrend(providerId.toString());
    //     console.log("Monthly Trend Result:", result);

    //     expect(result).toHaveLength(2); // 2 months

    //     const latestMonth = result[0]; // October 2025
    //     expect(latestMonth.month).toBe(10);
    //     expect(latestMonth.year).toBe(2025);
    //     expect(latestMonth.completedBookings).toBe(2);
    //     expect(latestMonth.revenue).toBe(1200); // 500+700
    //     expect(latestMonth.avgResponseTime).toBeCloseTo((5+15)/2, 0); // avg in minutes

    //     // Growth rate > 0 since current month is better than previous
    //     expect(latestMonth.growthRate).toBeGreaterThan(0);
    // });

});