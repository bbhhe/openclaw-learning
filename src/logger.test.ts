import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, setDebug } from './logger';

describe('Logger', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log');
        // Reset debug state (assuming default is false or env dependent)
        setDebug(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should log info messages', () => {
        logger.info('test info');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] test info'));
    });

    it('should not log debug messages by default (or when disabled)', () => {
        logger.debug('test debug');
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log debug messages when enabled', () => {
        setDebug(true);
        logger.debug('test debug enabled');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] test debug enabled'));
    });

    it('should stop logging debug messages when disabled again', () => {
        setDebug(true);
        logger.debug('visible');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        
        setDebug(false);
        logger.debug('hidden');
        expect(consoleSpy).toHaveBeenCalledTimes(1); // Still 1
    });
});
