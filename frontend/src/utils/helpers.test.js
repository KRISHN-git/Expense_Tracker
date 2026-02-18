
import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategoryConfig } from '../utils/constants';

describe('Category Helpers', () => {
    it('should return correct config for a valid category', () => {
        const foodConfig = getCategoryConfig('Food');
        expect(foodConfig).toBeDefined();
        expect(foodConfig.label).toBe('Food & Dining');
        expect(foodConfig.color).toContain('orange');
    });

    it('should return fallback for invalid category', () => {
        const invalidConfig = getCategoryConfig('SpaceTravel');
        // Assuming your getCategoryConfig falls back to 'Other' or returns undefined depending on implementation.
        // Based on previous code: return CATEGORIES.find(c => c.id === id) || CATEGORIES.find(c => c.id === 'Other');
        expect(invalidConfig).toBeDefined();
        expect(invalidConfig.id).toBe('Other');
    });

    it('should have all required fields in categories', () => {
        CATEGORIES.forEach(cat => {
            expect(cat).toHaveProperty('id');
            expect(cat).toHaveProperty('label');
            expect(cat).toHaveProperty('icon');
            expect(cat).toHaveProperty('color');
            expect(cat).toHaveProperty('bg');
        });
    });
});
