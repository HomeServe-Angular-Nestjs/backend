import { FeatureDefinition } from "@core/entities/interfaces/plans.entity.interface";

export const FEATURE_REGISTRY: Readonly<Record<string, FeatureDefinition>> =
    Object.freeze({
        BASIC_SUPPORT: {
            key: 'basic_support',
            type: 'boolean',
            label: 'Basic Support'
        },

        SERVICE_LISTING_LIMIT: {
            key: 'service_listing_limit',
            type: 'number',
            label: 'Service Listing Limit'
        },

        ANALYTICS_DASHBOARD: {
            key: 'analytics_dashboard',
            type: 'boolean',
            label: 'Analytics Dashboard'
        },

        SEARCH_PRIORITY: {
            key: 'search_priority',
            type: 'enum',
            values: ['low', 'medium', 'high'] as const
        }
    } as const);

export type FeatureKey = typeof FEATURE_REGISTRY[keyof typeof FEATURE_REGISTRY]['key'];
