import rateLimit from "express-rate-limit"; 

export const apiLimiter = rateLimit({
    windowMs:  60* 1000,
    max: 1000, // Limit each IP to 100 requests per `window`
    handler: function (req, res) {
        res.status(429).send({
            retryAfter: res.getHeader('Retry-After'),
            message: `Too many requests from this IP, please try again after 10 minutes! IP: ${req.ip}`,
        });
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}); 



