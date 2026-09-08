class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function asyncHandler(handler) {
    return (req, res) => {
        Promise.resolve(handler(req, res)).catch((error) => {
            const status = error instanceof AppError ? error.status : 500;
            if (status === 500) console.error(error);
            res.status(status).json({ error: error.message || 'Database error' });
        });
    };
}

module.exports = { AppError, asyncHandler };