export const LogLevel = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
};

const isDebug = process.env.DEBUG === 'true';

export const logger = {
    info: (msg: string, ...args: any[]) => {
        console.log(`ℹ️ [INFO] ${msg}`, ...args);
    },
    warn: (msg: string, ...args: any[]) => {
        console.warn(`⚠️ [WARN] ${msg}`, ...args);
    },
    error: (msg: string, ...args: any[]) => {
        console.error(`❌ [ERROR] ${msg}`, ...args);
    },
    debug: (msg: string, ...args: any[]) => {
        if (isDebug) {
            console.log(`🐛 [DEBUG] ${msg}`, ...args);
        }
    }
};
