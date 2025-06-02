import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();

  create(
    serviceName: string,
    options?: CircuitBreaker.Options,
  ): CircuitBreaker {
    if (this.breakers.has(serviceName)) {
      return this.breakers.get(serviceName);
    }

    const defaultOptions: CircuitBreaker.Options = {
      timeout: 10000, // Time in ms before a request times out
      errorThresholdPercentage: 50, // Percentage of failures before opening circuit
      resetTimeout: 30000, // Time to wait before trying again once circuit is open
      rollingCountTimeout: 10000, // Time window for counting failures
      volumeThreshold: 5, // Minimum number of requests needed before tripping circuit
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const dummyFunction = () =>
      Promise.reject(new Error('Circuit Breaker placeholder function'));

    const breaker = new CircuitBreaker(dummyFunction, mergedOptions);

    breaker.on('open', () => {
      this.logger.warn(`Circuit Breaker for '${serviceName}' is now OPEN`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit Breaker for '${serviceName}' is now CLOSED`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit Breaker for '${serviceName}' is now HALF-OPEN`);
    });

    breaker.on('fallback', () => {
      this.logger.warn(
        `Circuit Breaker for '${serviceName}' fallback triggered`,
      );
    });

    breaker.on('success', () => {
      this.logger.debug(`Circuit Breaker for '${serviceName}' success`);
    });

    breaker.on('failure', (error) => {
      this.logger.error(
        `Circuit Breaker for '${serviceName}' failure: ${error.message}`,
      );
    });

    this.breakers.set(serviceName, breaker);
    return breaker;
  }

  async execute<T>(
    serviceName: string,
    action: () => Promise<T>,
    fallback?: () => Promise<T>,
    options?: CircuitBreaker.Options,
  ): Promise<T> {
    let breaker = this.breakers.get(serviceName);

    if (!breaker) {
      breaker = this.create(serviceName, options);
    }

    breaker.action = action;

    if (fallback) {
      breaker.fallback = fallback;
    }

    try {
      return await breaker.fire();
    } catch (error) {
      this.logger.error(
        `Circuit Breaker '${serviceName}' error: ${error.message}`,
      );
      throw error;
    }
  }
}
