import rateLimit from 'express-rate-limit';
import { LogService } from "../../services/systemLogService.js";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  handler: function (req, res) {
    // Fire-and-forget — không block response
    LogService.write({
      message: `Rate limit triggered for IP: ${req.ip}`,
      actor_type: 'system',
      type: 'warning',
      status: 'failure',
      actionDetail: 'rate_limit.triggered',
      ipAddress: req.ip as string,
      metaData: {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'] ?? '',
      } as any,
    }).catch(err => console.error('[RateLimit] Failed to write log:', err));

    res.status(429).send({
      retryAfter: res.getHeader('Retry-After'),
      message: `Too many requests from this IP, please try again after 10 minutes! IP: ${req.ip}`,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});


