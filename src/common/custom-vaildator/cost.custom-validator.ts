import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'cost_custom_validator', async: false })
export class CostCustomValidator implements ValidatorConstraintInterface {
  validate(cost: number, args: ValidationArguments) {
    return cost % 5 == 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Cost should be a multiple of 5';
  }
}
