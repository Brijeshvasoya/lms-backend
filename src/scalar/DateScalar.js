import { GraphQLScalarType, Kind } from 'graphql';

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Custom Date scalar type for handling dates in ISO format',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date value');
      }
      return date.toISOString();
    }
    throw new Error('Invalid date value');
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date input');
      }
      return date;
    }
    throw new Error('Invalid date input');
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    }
    return null;
  }
});
