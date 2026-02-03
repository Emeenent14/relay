import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useUIStore } from '../../../stores/uiStore';
import { tourSteps } from '../../../lib/tourConfig';

export function AppTour() {
    const { hasSeenTour, completeTour } = useUIStore();

    useEffect(() => {
        if (hasSeenTour) {
            return;
        }

        const tourDriver = driver({
            showProgress: true,
            steps: tourSteps,
            onDestroyed: () => {
                completeTour();
            },
        });

        tourDriver.drive();

        return () => {
            tourDriver.destroy();
        };
    }, [hasSeenTour, completeTour]);

    return null;
}
