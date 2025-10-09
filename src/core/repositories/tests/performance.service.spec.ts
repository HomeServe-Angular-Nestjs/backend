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
    }, 30000);


    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });


    beforeEach(async () => {
        await bookingModel.deleteMany({});
    });

    it('Should calculate avg response time correctly', async () => {
        // Insert data
        await bookingModel.create([
            {
                providerId,
                createdAt: new Date('2025-01-01T10:00:00Z'),
                respondedAt: new Date('2025-01-01T10:05:00Z'), // 5 mins response
                expectedArrivalTime: new Date('2025-01-01T10:30:00Z'),
                actualArrivalTime: new Date('2025-01-01T10:33:00Z'), // 3 mins late → considered on time
                review: { rating: 4 },
                bookingStatus: 'completed',
            },
            {
                providerId,
                createdAt: new Date('2025-01-01T11:00:00Z'),
                respondedAt: new Date('2025-01-01T11:10:00Z'), // 10 mins response
                expectedArrivalTime: new Date('2025-01-01T11:30:00Z'),
                actualArrivalTime: new Date('2025-01-01T11:40:00Z'), // 10 mins late → not on time
                review: { rating: 5 },
                bookingStatus: 'pending',
            },
        ]);

        const result = await repository.getPerformanceSummary(providerId.toString());
        console.log("Result: ", JSON.stringify(result));

        // 1️⃣ Avg Response Time: (5 + 10) / 2 = 7.5 mins
        expect(result.responseTime.avgResponseTime).toBeCloseTo(7.5, 1);
        expect(result.responseTime.responseCount).toBe(2);

        // 2️⃣ On-Time Arrival Percentage: 1 on-time out of 2 → 50%
        expect(result.onTimeArrival.onTimePercent).toBeCloseTo(50, 0);

        // 3️⃣ Average Rating: (4 + 5) / 2 = 4.5
        expect(result.avgRating.avgRating).toBeCloseTo(4.5, 1);
        expect(result.avgRating.ratingCount).toBe(2);

        // 4️⃣ Completion Rate Percentage: 1 completed out of 2 → 50%
        expect(result.completionRate.completionRate).toBeCloseTo(50, 0);
    });
});