import { Controller, Get } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLE } from 'src/utils/constants';

@Controller('admin/circuit-breakers')
export class CircuitBreakerController {
  constructor(private readonly circuitBreakerService: CircuitBreakerService) {}

  @Get()
  @Roles(ROLE.ADMIN)
  getCircuitBreakersStatus() {
    const status = {};

    this.circuitBreakerService['breakers'].forEach((breaker, name) => {
      status[name] = {
        state: breaker.status.state,
        stats: {
          successes: breaker.stats.successes,
          failures: breaker.stats.failures,
          rejects: breaker.stats.rejects,
          timeouts: breaker.stats.timeouts,
        },
        options: breaker.options,
      };
    });

    return status;
  }
}
